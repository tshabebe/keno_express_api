import { Router } from 'express';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import { authRequired, signToken } from '../middleware/auth';
import { verifyWalletToken } from '../middleware/wallet';

const router = Router();

router.post('/auth/register', async (req, res) => {
  const { email, password, displayName } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'email in use' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password_hash: hash, display_name: displayName || email });
  const token = signToken({ userId: user._id.toString(), email });
  res.json({ token, user: { id: user._id, email, displayName: user.display_name, balance: user.wallet_balance ?? 0 } });
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash || '');
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = signToken({ userId: user._id.toString(), email });
  res.json({ token, user: { id: user._id, email, displayName: user.display_name, balance: user.wallet_balance ?? 0 } });
});

// Profile via wallet verification (align with Next Spin). If WALLET_URL not set, falls back to JWT-only data
router.get('/me', verifyWalletToken, async (req, res) => {
  const u: any = (req as any).user || {};
  // If wallet provided rich data, forward it. Otherwise load from local db by decoded id if present
  if (u && (u.email || u.balance !== undefined || u.chatId)) {
    return res.json(u);
  }
  const userId = (u.userId as string) || '';
  if (!userId) return res.status(400).json({ error: 'invalid token' });
  const dbUser = await User.findById(userId);
  if (!dbUser) return res.status(404).json({ error: 'not found' });
  return res.json({ id: dbUser._id, email: dbUser.email, displayName: dbUser.display_name, balance: dbUser.wallet_balance ?? 0 });
});

export default router;
