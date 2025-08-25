import { Router } from 'express';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import { signToken } from '../middleware/auth';

const router = Router();

router.post('/auth/register', async (req, res) => {
  const { email, password, displayName } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'email in use' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password_hash: hash, display_name: displayName || email });
  const token = signToken({ userId: user._id.toString(), email });
  res.json({ token, user: { id: user._id, email, displayName: user.display_name } });
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash || '');
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = signToken({ userId: user._id.toString(), email });
  res.json({ token, user: { id: user._id, email, displayName: user.display_name } });
});

export default router;
