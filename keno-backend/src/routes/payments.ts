import { Router } from 'express';
import { authRequired } from '../middleware/auth';
import { Transaction } from '../models/transaction';
import User from '../models/user';
import crypto from 'crypto';
import { Chapa } from 'chapa-nodejs';
import type { Request } from 'express';


const router = Router();

// NOTE: Raw body middleware must be mounted for webhook path in server.ts

router.post('/payments/init', authRequired, async (req, res) => {
  try {
    const userId = (req as any).user?.userId as string;
    const amount = Number((req.body?.amount ?? 0));
    const currency = String(req.body?.currency || 'ETB');
    if (!amount || amount <= 0) return res.status(400).json({ error: 'invalid amount' });

    const chapa = new Chapa({ secretKey: process.env.CHAPA_AUTH_KEY as string });
    const tx_ref = await chapa.genTxRef();

    await Transaction.create({ tx_ref, user_id: userId, amount, currency, type: 'deposit', status: 'pending' });

    const initRes = await chapa.initialize({ amount: String(amount), currency, tx_ref, return_url: process.env.RETURN_URL || 'http://localhost:5173' });
    const checkout = (initRes && (initRes as any).data && (initRes as any).data.checkout_url)
      || (initRes && (initRes as any).checkout_url)
      || (initRes && (initRes as any).data)
      || null;
    return res.json({ checkout_url: checkout, tx_ref });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('init payment error', e);
    return res.status(500).json({ error: 'failed to init payment' });
  }
});

router.post('/payments/webhook', async (req, res) => {
  try {
    const debugId = Math.random().toString(36).slice(2, 8)
    const secret = process.env.WEBHOOK_SECRET || ''
    if (!secret) {
      console.error(`[webhook ${debugId}] missing WEBHOOK_SECRET env`)
      return res.status(401).json({ error: 'signature verification not configured' })
    }

    let rawBody = ''
    try {
      if (Buffer.isBuffer((req as any).body)) rawBody = (req as any).body.toString('utf8')
      else if (typeof (req as any).rawBody === 'string') rawBody = (req as any).rawBody
      else if (typeof req.body === 'string') rawBody = req.body
      else rawBody = JSON.stringify(req.body || {})
    } catch (e) {
      console.error(`[webhook ${debugId}] failed to extract raw body`, e)
      return res.status(400).json({ error: 'invalid raw body' })
    }

    const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
    const headerSigRaw = (req.headers['x-chapa-signature'] || req.headers['chapa-signature'] || req.headers['Chapa-Signature'] || req.headers['X-Chapa-Signature']) as string | undefined
    const headerSig = typeof headerSigRaw === 'string' ? headerSigRaw.trim().toLowerCase() : ''
    const computedLc = computed.toLowerCase()
    if (!headerSig) {
      console.error(`[webhook ${debugId}] missing signature header`)
      return res.status(401).json({ error: 'missing signature' })
    }
    if (headerSig !== computedLc) {
      console.error(`[webhook ${debugId}] signature mismatch`, {
        headerSig: headerSig.slice(0, 8) + '...',
        computed: computedLc.slice(0, 8) + '...',
        length: rawBody.length,
      })
      return res.status(401).json({ error: 'invalid signature' })
    }

    let body: any
    try {
      body = JSON.parse(rawBody || '{}')
    } catch (e) {
      console.error(`[webhook ${debugId}] JSON parse error`, e)
      return res.status(400).json({ error: 'invalid json' })
    }
    const tx_ref = body?.tx_ref as string | undefined
    const amount = Number(body?.amount || 0)
    if (!tx_ref) return res.status(400).json({ error: 'missing tx_ref' })

    const chapa = new Chapa({ secretKey: process.env.CHAPA_AUTH_KEY as string })
    const verify = await chapa.verify({ tx_ref })
    if (verify?.status !== 'success') {
      console.error(`[webhook ${debugId}] verify failed`, { tx_ref, status: verify?.status })
      return res.status(400).json({ error: 'verification failed' })
    }

    const tx = await Transaction.findOne({ tx_ref })
    if (!tx) {
      console.error(`[webhook ${debugId}] tx not found`, { tx_ref })
      return res.status(404).json({ error: 'tx not found' })
    }
    if (tx.verified) return res.json({ ok: true })

    try {
      await User.updateOne({ _id: tx.user_id }, { $inc: { wallet_balance: amount } })
      console.log(`[txn ${debugId}] credit deposit`, { user_id: tx.user_id, tx_ref, amount })
    } catch (e) {
      console.error(`[webhook ${debugId}] wallet credit error`, e)
      return res.status(500).json({ error: 'wallet credit failed' })
    }
    await Transaction.updateOne({ tx_ref }, { $set: { status: 'completed', verified: true, updated_at: new Date() } })
    try {
      const io = req.app.locals.io as any
      io?.to(`lobby:user:${tx.user_id}`).emit('payment:status', { type: 'deposit', provider: 'chapa', tx_ref, status: 'completed', amount })
    } catch {}
    return res.json({ ok: true })
  } catch (e) {
    console.error('webhook error', e)
    return res.status(500).json({ error: 'webhook failed', detail: e instanceof Error ? e.message : String(e) })
  }
})

// =============== Lakipay integration (optional alternative PSP) ===============
function getBaseUrl(req: Request): string {
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http'
  const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:3000'
  return `${proto}://${host}`
}

router.post('/payments/lakipay/init', authRequired, async (req, res) => {
  try {
    const userId = (req as any).user?.userId as string
    const amount = Number((req.body?.amount ?? 0))
    const phone = String(req.body?.phone || '')
    if (!amount || amount <= 0) return res.status(400).json({ error: 'invalid amount' })
    if (!phone) return res.status(400).json({ error: 'phone required' })

    const apiKey = process.env.LAKIPAY_API_KEY
    const bearer = process.env.LAKIPAY_BEARER_TOKEN
    if (!apiKey || !bearer) return res.status(500).json({ error: 'lakipay not configured' })

    const tx_ref = `LAKI_${crypto.randomUUID()}`
    await Transaction.create({ tx_ref, user_id: userId, amount, currency: 'ETB', type: 'deposit', status: 'pending' })

    const callback = `${getBaseUrl(req)}/payments/lakipay/webhook`
    const successUrl = process.env.RETURN_URL || `${getBaseUrl(req)}`
    const failedUrl = successUrl
    const payload = {
      amount,
      callback_url: callback,
      currency: 'ETB',
      description: 'Wallet deposit',
      phone_number: phone.startsWith('251') ? phone : `251${phone}`,
      redirects: { failed: failedUrl, success: successUrl },
      reference: tx_ref,
      supported_mediums: ['MPESA', 'TELEBIRR', 'CBE'],
    }

    const resp = await fetch('https://api.lakipay.co/api/v2/payment/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'Authorization': `Bearer ${bearer}`,
      },
      body: JSON.stringify(payload),
    })
    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      console.error('[lakipay init] error', data)
      return res.status(400).json({ error: 'lakipay init failed', details: data })
    }
    console.log('[lakipay init] ok', { user_id: userId, tx_ref, amount })
    return res.json({ tx_ref, lakipay: data })
  } catch (e) {
    console.error('lakipay init error', e)
    return res.status(500).json({ error: 'failed to init lakipay' })
  }
})

router.post('/payments/lakipay/webhook', async (req, res) => {
  try {
    // Lakipay webhook structure may vary; accept JSON and use reference/amount/status
    const body: any = req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)
      ? req.body
      : JSON.parse(Buffer.isBuffer((req as any).body) ? (req as any).body.toString('utf8') : (req as any).rawBody || '{}')

    const tx_ref = body?.reference || body?.tx_ref
    const amount = Number(body?.amount || 0)
    const status = String(body?.status || body?.payment_status || '').toLowerCase()
    if (!tx_ref) return res.status(400).json({ error: 'missing reference' })

    const tx = await Transaction.findOne({ tx_ref })
    if (!tx) {
      console.error('[lakipay webhook] tx not found', { tx_ref })
      return res.status(404).json({ error: 'tx not found' })
    }
    if (tx.verified) return res.json({ ok: true })
    if (!(status === 'success' || status === 'completed' || status === 'paid')) {
      console.error('[lakipay webhook] non-success status', { tx_ref, status })
      return res.status(400).json({ error: 'not successful' })
    }

    try {
      await User.updateOne({ _id: tx.user_id }, { $inc: { wallet_balance: amount || tx.amount || 0 } })
      await Transaction.updateOne({ tx_ref }, { $set: { status: 'completed', verified: true, updated_at: new Date() } })
      console.log('[txn lakipay] credit deposit', { user_id: tx.user_id, tx_ref, amount: amount || tx.amount })
      return res.json({ ok: true })
    } catch (e) {
      console.error('[lakipay webhook] credit error', e)
      return res.status(500).json({ error: 'wallet credit failed' })
    }
  } catch (e) {
    console.error('lakipay webhook error', e)
    return res.status(500).json({ error: 'lakipay webhook failed' })
  }
})

// =============== Chapa withdrawal ===============
router.post('/payments/chapa/withdraw', authRequired, async (req, res) => {
  try {
    const userId = (req as any).user?.userId as string
    const amount = Number(req.body?.amount || 0)
    const account_number = String(req.body?.account_number || '')
    const account_name = String(req.body?.account_name || '')
    const bank_code = String(req.body?.bank_code || '')
    const currency = String(req.body?.currency || 'ETB')
    if (!amount || amount <= 0) return res.status(400).json({ error: 'invalid amount' })
    if (!account_number || !bank_code) return res.status(400).json({ error: 'account_number and bank_code required' })

    // Create pending transaction and debit wallet (hold)
    const tx_ref = `WD_CHAPA_${crypto.randomUUID()}`
    await Transaction.create({ tx_ref, user_id: userId, amount, currency, type: 'withdrawal', status: 'pending' })

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, wallet_balance: { $gte: amount } },
      { $inc: { wallet_balance: -amount } },
      { new: true }
    )
    if (!updatedUser) return res.status(400).json({ error: 'insufficient balance' })

    await Transaction.updateOne({ tx_ref }, { $set: { status: 'processing', updated_at: new Date() } })

    try {
      const chapa = new Chapa({ secretKey: process.env.CHAPA_AUTH_KEY as string })
      const transferResp = await chapa.transfer({
        amount: String(amount),
        account_name,
        account_number,
        currency,
        reference: tx_ref,
        bank_code: Number(bank_code),
      })
      await Transaction.updateOne({ tx_ref }, { $set: { status: 'completed', verified: true, updated_at: new Date() } })
      console.log('[txn wd] chapa completed', { user_id: userId, tx_ref, amount })
      return res.json({ ok: true, data: transferResp?.data || null, tx_ref })
    } catch (e) {
      // Refund on failure
      await User.updateOne({ _id: userId }, { $inc: { wallet_balance: amount } })
      await Transaction.updateOne({ tx_ref }, { $set: { status: 'failed', updated_at: new Date() } })
      console.error('[txn wd] chapa failed, refunded', e)
      return res.status(400).json({ error: 'withdrawal failed', tx_ref })
    }
  } catch (e) {
    console.error('chapa withdraw error', e)
    return res.status(500).json({ error: 'withdrawal error' })
  }
})

// =============== Lakipay withdrawal ===============
router.post('/payments/lakipay/withdraw', authRequired, async (req, res) => {
  try {
    const userId = (req as any).user?.userId as string
    const amount = Number(req.body?.amount || 0)
    const phone = String(req.body?.phone || '')
    const medium = String(req.body?.medium || 'MPESA')
    if (!amount || amount <= 0) return res.status(400).json({ error: 'invalid amount' })
    if (!phone) return res.status(400).json({ error: 'phone required' })
    const apiKey = process.env.LAKIPAY_API_KEY
    const bearer = process.env.LAKIPAY_BEARER_TOKEN
    if (!apiKey || !bearer) return res.status(500).json({ error: 'lakipay not configured' })

    const tx_ref = `WD_LAKI_${crypto.randomUUID()}`
    await Transaction.create({ tx_ref, user_id: userId, amount, currency: 'ETB', type: 'withdrawal', status: 'pending' })

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, wallet_balance: { $gte: amount } },
      { $inc: { wallet_balance: -amount } },
      { new: true }
    )
    if (!updatedUser) return res.status(400).json({ error: 'insufficient balance' })
    await Transaction.updateOne({ tx_ref }, { $set: { status: 'processing', updated_at: new Date() } })

    const payload = {
      amount,
      callback_url: `${getBaseUrl(req)}/payments/lakipay/webhook`,
      currency: 'ETB',
      medium,
      phone_number: phone.startsWith('251') ? phone : `251${phone}`,
      reference: tx_ref,
    }
    try {
      const resp = await fetch('https://api.lakipay.co/api/v2/payment/withdrawal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'Authorization': `Bearer ${bearer}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) throw new Error(JSON.stringify(data))
      await Transaction.updateOne({ tx_ref }, { $set: { status: 'completed', verified: true, updated_at: new Date() } })
      console.log('[txn wd] lakipay completed', { user_id: userId, tx_ref, amount })
      return res.json({ ok: true, data, tx_ref })
    } catch (e) {
      await User.updateOne({ _id: userId }, { $inc: { wallet_balance: amount } })
      await Transaction.updateOne({ tx_ref }, { $set: { status: 'failed', updated_at: new Date() } })
      console.error('[txn wd] lakipay failed, refunded', e)
      return res.status(400).json({ error: 'withdrawal failed', tx_ref })
    }
  } catch (e) {
    console.error('lakipay withdraw error', e)
    return res.status(500).json({ error: 'withdrawal error' })
  }
})

// =============== Chapa banks (for UI dropdowns) ===============
router.get('/payments/chapa/banks', async (req, res) => {
  try {
    const key = process.env.CHAPA_AUTH_KEY
    if (!key) return res.status(500).json({ error: 'chapa not configured' })
    const country = (req.query.country as string) || 'ET'
    const resp = await fetch(`https://api.chapa.co/v1/banks?country=${encodeURIComponent(country)}`, {
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
    })
    const json = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      console.error('[chapa banks] error', json)
      return res.status(resp.status || 500).json({ error: 'failed to fetch banks', details: json })
    }
    // Normalize fields commonly returned by Chapa
    const list = Array.isArray(json?.data) ? json.data : []
    const banks = list.map((b: any) => ({
      id: String(b?.id ?? ''),
      name: String(b?.name ?? b?.BankName ?? ''),
      code: String(b?.code ?? b?.BankCode ?? ''),
      type: b?.type ? String(b.type) : undefined,
    }))
    return res.json({ country, banks })
  } catch (e) {
    console.error('chapa banks error', e)
    return res.status(500).json({ error: 'chapa banks error' })
  }
})

// =============== Unified payment options for UI ===============
router.get('/payments/options', async (req, res) => {
  try {
    // Lakipay mediums from env or default set
    const mediumsEnv = process.env.LAKIPAY_SUPPORTED_MEDIUMS || ''
    const lakipayMediums = mediumsEnv
      ? mediumsEnv.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
      : ['MPESA', 'TELEBIRR', 'CBE']

    // Optionally include Chapa banks (ignore failure)
    let chapa: any = { banks: [] as Array<{ id: string; name: string; code: string; type?: string }> }
    try {
      const key = process.env.CHAPA_AUTH_KEY
      if (key) {
        const resp = await fetch('https://api.chapa.co/v1/banks?country=ET', {
          headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
        })
        const json = await resp.json().catch(() => ({}))
        if (resp.ok && Array.isArray(json?.data)) {
          chapa.banks = json.data.map((b: any) => ({
            id: String(b?.id ?? ''),
            name: String(b?.name ?? b?.BankName ?? ''),
            code: String(b?.code ?? b?.BankCode ?? ''),
            type: b?.type ? String(b.type) : undefined,
          }))
        }
      }
    } catch (e) {
      console.error('[payments/options] chapa banks fetch failed', e)
    }

    return res.json({
      chapa,
      lakipay: { mediums: lakipayMediums },
    })
  } catch (e) {
    console.error('payments options error', e)
    return res.status(500).json({ error: 'failed to load payment options' })
  }
})

export default router;


