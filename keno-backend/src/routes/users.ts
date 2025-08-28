import { Router } from 'express';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import { authRequired, signToken } from '../middleware/auth';
import { z } from 'zod';
// Inline Zod phone schema to avoid cross-package tsconfig issues in build
const PhoneNumberSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{6,14}$/, 'Enter a valid phone number');
const LoginWithPhoneSchema = z.object({ phone_number: PhoneNumberSchema, password: z.string().min(6) });

const router = Router();

// Register (email or phone supported)
router.post('/auth/register', async (req, res) => {
  const BodySchema = z.object({
    email: z.string().email().optional(),
    phone_number: z.string().trim().optional(),
    password: z.string().min(6),
    displayName: z.string().min(1).optional(),
  });
  const parse = BodySchema.safeParse(req.body || {});
  if (!parse.success) return res.status(400).json({ error: 'invalid input', details: parse.error.flatten() });
  const { email, phone_number, password, displayName } = parse.data;
  if (!email && !phone_number) return res.status(400).json({ error: 'email or phone required' });

  const orClauses: Array<Record<string, unknown>> = [];
  if (email) orClauses.push({ email });
  if (phone_number) orClauses.push({ phone_number });
  const exists = await User.findOne(orClauses.length ? { $or: orClauses } : { email: '__never__' });
  if (exists) return res.status(409).json({ error: 'account already exists' });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email: email || `${phone_number}@local`, phone_number, password_hash: hash, display_name: displayName || email || phone_number || 'User' });
  const token = signToken({ userId: user._id.toString(), email: user.email, phone_number: user.phone_number });
  res.json({ token, user: { id: user._id, email: user.email, phone_number: user.phone_number, displayName: user.display_name, balance: user.wallet_balance ?? 0 } });
});

router.post('/auth/login', async (req, res) => {
  const BodySchema = z.object({ email: z.string().email(), password: z.string().min(6) });
  const parse = BodySchema.safeParse(req.body || {});
  if (!parse.success) return res.status(400).json({ error: 'invalid input', details: parse.error.flatten() });
  const { email, password } = parse.data;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash || '');
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = signToken({ userId: user._id.toString(), email: user.email, phone_number: user.phone_number });
  res.json({ token, user: { id: user._id, email: user.email, phone_number: user.phone_number, displayName: user.display_name, balance: user.wallet_balance ?? 0 } });
});

// Login with phone number
router.post('/auth/login-phone', async (req, res) => {
  const parse = LoginWithPhoneSchema.safeParse(req.body || {});
  if (!parse.success) return res.status(400).json({ error: 'invalid input', details: parse.error.flatten() });
  const { phone_number, password } = parse.data;
  const user = await User.findOne({ phone_number });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash || '');
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = signToken({ userId: user._id.toString(), email: user.email, phone_number: user.phone_number });
  res.json({ token, user: { id: user._id, email: user.email, phone_number: user.phone_number, displayName: user.display_name, balance: user.wallet_balance ?? 0 } });
});

// Local profile using auth token
router.get('/me', authRequired, async (req, res) => {
  const u: any = (req as any).user || {};
  const userId = String(u.userId || '');
  if (!userId) return res.status(400).json({ error: 'invalid token' });
  const dbUser = await User.findById(userId);
  if (!dbUser) return res.status(404).json({ error: 'not found' });
  return res.json({ id: dbUser._id, email: dbUser.email, displayName: dbUser.display_name, balance: dbUser.wallet_balance ?? 0 });
});

export default router;
