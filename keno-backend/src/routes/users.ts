import { Router } from 'express';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import { authRequired, signToken } from '../middleware/auth';

const router = Router();

router.post('/auth/register', async (req, res) => {
  let { phoneNumber, password, displayName } = req.body || {} as { phoneNumber?: string; password?: string; displayName?: string };
  if (!phoneNumber || !password) return res.status(400).json({ error: 'phone and password required' });
  // Normalize inputs
  phoneNumber = typeof phoneNumber === 'string' ? phoneNumber.replace(/\s+/g, '') : undefined;
  const existsPhone = await User.findOne({ phone_number: phoneNumber });
  if (existsPhone) return res.status(409).json({ error: 'phone in use' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ phone_number: phoneNumber!, password_hash: hash, display_name: (displayName || phoneNumber || '').toString() });
    const token = signToken({ userId: user._id.toString(), phoneNumber: user.phone_number || undefined });
    return res.json({ token, user: { id: user._id, displayName: user.display_name, balance: user.wallet_balance ?? 0 } });
  } catch (e: any) {
    if (e && e.code === 11000) return res.status(409).json({ error: 'phone in use' });
    throw e;
  }
});

router.post('/auth/login', async (req, res) => {
  let { phoneNumber, password } = req.body || {} as { phoneNumber?: string; password?: string };
  if (!phoneNumber || !password) return res.status(400).json({ error: 'phone and password required' });
  phoneNumber = typeof phoneNumber === 'string' ? phoneNumber.replace(/\s+/g, '') : undefined;
  const user = await User.findOne({ phone_number: phoneNumber });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash || '');
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = signToken({ userId: user._id.toString(), phoneNumber: user.phone_number || undefined });
  res.json({ token, user: { id: user._id, displayName: user.display_name, balance: user.wallet_balance ?? 0 } });
});

// Profile via local JWT auth and database lookup
router.get('/me', authRequired, async (req, res) => {
  const u: any = (req as any).user || {};
  const userId = (u.userId as string) || '';
  if (!userId) return res.status(400).json({ error: 'invalid token' });
  const dbUser = await User.findById(userId);
  if (!dbUser) return res.status(404).json({ error: 'not found' });
  return res.json({ id: dbUser._id, displayName: dbUser.display_name, balance: dbUser.wallet_balance ?? 0 });
});

export default router;
