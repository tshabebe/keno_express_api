import { Router } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/user'
import { adminRequired, signAdminToken } from '../middleware/auth'
import GameConfig from '../models/game_config'

const router = Router()

router.post('/admin/login', async (req, res) => {
  const { phoneNumber, password } = (req.body || {}) as { phoneNumber?: string; password?: string }
  if (!phoneNumber || !password) return res.status(400).json({ error: 'phone and password required' })
  const phone = typeof phoneNumber === 'string' ? phoneNumber.replace(/\s+/g, '') : ''
  const user = await User.findOne({ phone_number: phone })
  if (!user || user.role !== 'admin') return res.status(401).json({ error: 'invalid credentials' })
  const ok = await bcrypt.compare(password, user.password_hash || '')
  if (!ok) return res.status(401).json({ error: 'invalid credentials' })
  const token = signAdminToken({ adminId: user._id.toString() })
  res.cookie('admin_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !!process.env.PROD,
    maxAge: 60 * 60 * 1000,
    path: '/',
  })
  return res.json({ ok: true, admin: { id: user._id, displayName: user.display_name } })
})

router.post('/admin/logout', adminRequired, async (_req, res) => {
  res.clearCookie('admin_session', { path: '/' })
  res.json({ ok: true })
})

router.get('/admin/configs/:game', adminRequired, async (req, res) => {
  const game = req.params.game
  const cfg = await GameConfig.findOne({ game })
  if (!cfg) return res.json({ game, version: 0, data: {}, updated_at: null })
  res.json({ game: cfg.game, version: cfg.version, data: cfg.data, updatedAt: cfg.updated_at })
})

router.put('/admin/configs/:game', adminRequired, async (req, res) => {
  const game = req.params.game
  const data = (req.body && typeof req.body === 'object') ? (req.body as any).data ?? req.body : {}
  const adminId = (req as any).admin?.adminId
  const existing = await GameConfig.findOne({ game })
  if (!existing) {
    const created = await GameConfig.create({ game, version: 1, data, updated_by: adminId })
    return res.json({ ok: true, game: created.game, version: created.version, data: created.data })
  }
  existing.data = data
  existing.version = (existing.version || 1) + 1
  existing.updated_by = adminId
  existing.updated_at = new Date()
  await existing.save()
  res.json({ ok: true, game: existing.game, version: existing.version, data: existing.data })
})

// public read-only endpoint for active config
router.get('/games/:game/config', async (req, res) => {
  const game = req.params.game
  const cfg = await GameConfig.findOne({ game })
  res.json(cfg ? { game: cfg.game, version: cfg.version, data: cfg.data } : { game, version: 0, data: {} })
})

export default router


