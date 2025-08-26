import { Router } from 'express';
import { authRequired } from '../middleware/auth';
import Lobby, { type LobbyDoc } from '../models/lobby';

const router = Router();

router.get('/lobbies', async (_req, res) => {
  const items = await Lobby.find();
  res.json(items.map((l) => ({ id: String((l as any)._id), ...(l as any).toObject ? (l as any).toObject() : l })));
});

router.post('/lobbies', authRequired, async (req, res) => {
  const { name, maxPlayers, roundId } = req.body || {};
  const ownerId = (req as any).user?.userId as string;
  const lobby: LobbyDoc = await Lobby.create({ name: name || 'Lobby', max_players: maxPlayers || 10, players: [], owner_id: ownerId, round_id: roundId });
  res.json({ id: String(lobby._id), ...lobby.toObject() });
});

router.post('/lobbies/:id/join', authRequired, async (req, res) => {
  const id = req.params.id;
  const lobby = await Lobby.findById(id);
  if (!lobby) return res.status(404).json({ error: 'not found' });
  const userId = (req as any).user?.userId as string;
  const players: string[] = lobby.players || [];
  if (players.includes(userId)) return res.json({ ok: true });
  if ((players.length || 0) >= (lobby.max_players || 10)) return res.status(400).json({ error: 'lobby full' });
  await Lobby.updateOne({ _id: lobby._id }, { $addToSet: { players: userId } });
  res.json({ ok: true });
});

router.post('/lobbies/:id/round', authRequired, async (req, res) => {
  const id = req.params.id;
  const { roundId } = req.body || {};
  await Lobby.updateOne({ _id: id }, { $set: { round_id: roundId } });
  res.json({ ok: true });
});

router.post('/lobbies/:id/leave', authRequired, async (req, res) => {
  const id = req.params.id;
  const userId = (req as any).user?.userId as string;
  await Lobby.updateOne({ _id: id }, { $pull: { players: userId } });
  res.json({ ok: true });
});

export default router;
