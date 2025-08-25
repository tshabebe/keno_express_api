import { Router } from 'express';
import { getDb } from '../lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '../middleware/auth';

const router = Router();

router.post('/auth/register', async (req, res) => {
  const { email, password, displayName } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const db = await getDb();
  const users = db.collection('users');
  const exists = await users.findOne({ email });
  if (exists) return res.status(409).json({ error: 'email in use' });
  const hash = await bcrypt.hash(password, 10);
  const result = await users.insertOne({ email, password_hash: hash, display_name: displayName || email, created_at: new Date() });
  const token = signToken({ userId: result.insertedId.toString(), email });
  res.json({ token, user: { id: result.insertedId, email, displayName: displayName || email } });
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const db = await getDb();
  const user = await db.collection('users').findOne({ email });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, (user as any).password_hash || '');
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = signToken({ userId: (user as any)._id.toString(), email });
  res.json({ token, user: { id: (user as any)._id, email, displayName: (user as any).display_name } });
});

export default router;
