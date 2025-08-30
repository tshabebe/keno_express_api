import { Router } from 'express';
import { authRequired } from '../middleware/auth';
import { Transaction } from '../models/transaction';
import User from '../models/user';
import crypto from 'crypto';
import { Chapa } from 'chapa-nodejs';



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
    } catch (e) {
      console.error(`[webhook ${debugId}] wallet credit error`, e)
      return res.status(500).json({ error: 'wallet credit failed' })
    }
    await Transaction.updateOne({ tx_ref }, { $set: { status: 'completed', verified: true, updated_at: new Date() } })
    return res.json({ ok: true })
  } catch (e) {
    console.error('webhook error', e)
    return res.status(500).json({ error: 'webhook failed', detail: e instanceof Error ? e.message : String(e) })
  }
})

export default router;


