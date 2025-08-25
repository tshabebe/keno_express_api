import { apiFetch } from './http'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export type Round = {
  _id: string
  starts_at?: string
  ends_at?: string
}

export type Ticket = {
  _id: string
  round_id: string
  played_number: number[]
  created_at: string
  bet_amount?: number
}

export async function getRounds(): Promise<Round[]> {
  const res = await apiFetch(`${API_BASE}/rounds`)
  if (!res.ok) throw new Error('Failed to load rounds')
  return res.json()
}

export async function getCurrentRound(): Promise<Round | null> {
  const res = await apiFetch(`${API_BASE}/rounds/current`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to load current round')
  return res.json()
}

export async function createTicket(params: { roundId: string; numbers: number[]; betAmount: number }): Promise<Ticket> {
  const qs = new URLSearchParams()
  qs.set('round_id', params.roundId)
  const padded = [...params.numbers].slice(0, 10)
  // backend expects number_one..number_ten with at least 5 numbers
  padded.forEach((n, idx) => qs.set(indexToParam(idx), String(n)))
  const res = await apiFetch(`${API_BASE}/tickets?${qs.toString()}`, { method: 'POST', body: JSON.stringify({ bet_amount: params.betAmount }) })
  if (!res.ok) throw new Error('Failed to create ticket')
  return res.json()
}

export async function postDraw(roundId: string): Promise<{
  current_timestamp: string
  drawn: { round_id: string; drawn_number: number[]; created_at: string }
  winnings: Array<{ played_number: number[] }>
}> {
  const res = await apiFetch(`${API_BASE}/drawnings?round_id=${encodeURIComponent(roundId)}`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to run draw')
  return res.json()
}

export async function createTodayRound(): Promise<Round> {
  const today = new Date().toISOString().slice(0, 10)
  const res = await apiFetch(`${API_BASE}/rounds?starts_at=${encodeURIComponent(today)}`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to create round')
  return res.json()
}

function indexToParam(index: number): string {
  const map = [
    'number_one',
    'number_two',
    'number_three',
    'number_four',
    'number_five',
    'number_six',
    'number_seven',
    'number_eight',
    'number_nine',
    'number_ten',
  ]
  return map[index] || 'number_ten'
}

