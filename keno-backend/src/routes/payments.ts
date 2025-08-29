import { Router } from 'express';
import { authRequired } from '../middleware/auth';
import { Transaction } from '../models/transaction';
import User from '../models/user';
import crypto from 'crypto';

// Lazy import to avoid top-level require if key is missing
function getChapa() {
  const { Chapa } = require('chapa-nodejs');
  const key = process.env.CHAPA_AUTH_KEY as string;
  return new Chapa({ secretKey: key });
}

const router = Router();

// NOTE: Raw body middleware must be mounted for webhook path in server.ts

router.post('/payments/init', authRequired, async (req, res) => {
  try {
    const userId = (req as any).user?.userId as string;
    const amount = Number((req.body?.amount ?? 0));
    const currency = String(req.body?.currency || 'ETB');
    if (!amount || amount <= 0) return res.status(400).json({ error: 'invalid amount' });

    const chapa = getChapa();
    const tx_ref = await chapa.genTxRef();

    await Transaction.create({ tx_ref, user_id: userId, amount, currency, type: 'deposit', status: 'pending' });

    const url = await chapa.initialize({ amount: String(amount), currency, tx_ref, return_url: process.env.RETURN_URL || 'http://localhost:5173' });
    return res.json({ checkout_url: url?.data, tx_ref });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('init payment error', e);
    return res.status(500).json({ error: 'failed to init payment' });
  }
});

router.post('/payments/webhook', async (req, res) => {
  try {
    const rawBody = (req as any).rawBody ?? (req.body?.toString ? req.body.toString('utf8') : '');
    const secret = process.env.WEBHOOK_SECRET || '';
    const hash = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const sig = (req.headers['chapa-signature'] || req.headers['Chapa-Signature'] || req.headers['x-chapa-signature'] || req.headers['X-Chapa-Signature']) as string | undefined;
    if (!sig || sig !== hash) return res.status(401).json({ error: 'invalid signature' });

    const body = JSON.parse(rawBody || '{}');
    const tx_ref = body?.tx_ref as string | undefined;
    const amount = Number(body?.amount || 0);
    if (!tx_ref) return res.status(400).json({ error: 'missing tx_ref' });

    const chapa = getChapa();
    const verify = await chapa.verify({ tx_ref });
    if (verify?.status !== 'success') return res.status(400).json({ error: 'verification failed' });

    const tx = await Transaction.findOne({ tx_ref });
    if (!tx) return res.status(404).json({ error: 'tx not found' });
    if (tx.verified) return res.json({ ok: true });

    // credit user, mark verified
    await User.updateOne({ _id: tx.user_id }, { $inc: { wallet_balance: amount } });
    await Transaction.updateOne({ tx_ref }, { $set: { status: 'completed', verified: true, updated_at: new Date() } });
    return res.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('webhook error', e);
    return res.status(500).json({ error: 'webhook failed' });
  }
});

export default router;


