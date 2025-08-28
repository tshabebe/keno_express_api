import { Router } from 'express';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import { authRequired, signToken } from '../middleware/auth';

const router = Router();

router.post('/auth/register', async (req, res) => {
  const { email, phoneNumber, password, displayName } = req.body || {} as { email?: string; phoneNumber?: string; password?: string; displayName?: string };
  if ((!email && !phoneNumber) || !password) return res.status(400).json({ error: 'email or phone and password required' });
  if (email) {
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'email in use' });
  }
  if (phoneNumber) {
    const existsPhone = await User.findOne({ phone_number: phoneNumber });
    if (existsPhone) return res.status(409).json({ error: 'phone in use' });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email: email || '', phone_number: phoneNumber || undefined, password_hash: hash, display_name: displayName || email || phoneNumber });
  const token = signToken({ userId: user._id.toString(), email: user.email || undefined, phoneNumber: user.phone_number || undefined });
  res.json({ token, user: { id: user._id, email: user.email, displayName: user.display_name, balance: user.wallet_balance ?? 0 } });
});

router.post('/auth/login', async (req, res) => {
  const { email, phoneNumber, password } = req.body || {} as { email?: string; phoneNumber?: string; password?: string };
  if ((!email && !phoneNumber) || !password) return res.status(400).json({ error: 'email or phone and password required' });
  const user = email ? await User.findOne({ email }) : await User.findOne({ phone_number: phoneNumber });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash || '');
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = signToken({ userId: user._id.toString(), email: user.email || undefined, phoneNumber: user.phone_number || undefined });
  res.json({ token, user: { id: user._id, email: user.email, displayName: user.display_name, balance: user.wallet_balance ?? 0 } });
});

// Profile via local JWT auth and database lookup
router.get('/me', authRequired, async (req, res) => {
  const u: any = (req as any).user || {};
  const userId = (u.userId as string) || '';
  if (!userId) return res.status(400).json({ error: 'invalid token' });
  const dbUser = await User.findById(userId);
  if (!dbUser) return res.status(404).json({ error: 'not found' });
  return res.json({ id: dbUser._id, email: dbUser.email, displayName: dbUser.display_name, balance: dbUser.wallet_balance ?? 0 });
});

export default router;
