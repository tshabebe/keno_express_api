import { apiFetch } from './http'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export type Lobby = { id: string; name: string; max_players: number; players: string[]; owner_id: string }

export async function listLobbies(): Promise<Lobby[]> {
  const res = await apiFetch(`${API_BASE}/lobbies`)
  if (!res.ok) throw new Error('Failed to load lobbies')
  return res.json()
}

export async function createLobby(params: { name: string; maxPlayers?: number }) {
  const res = await apiFetch(`${API_BASE}/lobbies`, { method: 'POST', body: JSON.stringify(params) })
  if (!res.ok) throw new Error('Failed to create lobby')
  return res.json()
}

export async function joinLobbyApi(id: string) {
  const res = await apiFetch(`${API_BASE}/lobbies/${id}/join`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to join lobby')
  return res.json()
}

export async function leaveLobbyApi(id: string) {
  const res = await apiFetch(`${API_BASE}/lobbies/${id}/leave`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to leave lobby')
  return res.json()
}

