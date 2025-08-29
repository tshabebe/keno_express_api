import { apiFetch } from './http'
import { getApiBaseUrl } from './env'
import type { Round as SharedRound, Ticket as SharedTicket, DrawCompletedPayload } from 'shared/types'
import { z } from 'zod'
import { DrawCompletedSchema, RoundSchema, TicketSchema } from './api-validate'

const API_BASE = getApiBaseUrl()

export type Round = SharedRound
export type Ticket = SharedTicket

export async function getRounds(): Promise<Round[]> {
  const res = await apiFetch(`${API_BASE}/rounds`)
  if (!res.ok) throw new Error('Failed to load rounds')
  const data = await res.json()
  const parsed = z.array(RoundSchema).safeParse(data)
  if (!parsed.success) throw new Error('Invalid rounds payload')
  return parsed.data
}

export async function getCurrentRound(): Promise<Round | null> {
  const res = await apiFetch(`${API_BASE}/rounds/current`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to load current round')
  const data = await res.json()
  const parsed = RoundSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid round payload')
  return parsed.data
}

export async function createTicket(params: { roundId: string; numbers: number[]; betAmount: number }): Promise<Ticket> {
  const qs = new URLSearchParams()
  qs.set('round_id', params.roundId)
  const padded = [...params.numbers].slice(0, 10)
  // backend expects number_one..number_ten with at least 5 numbers
  padded.forEach((n, idx) => qs.set(indexToParam(idx), String(n)))
  const res = await apiFetch(`${API_BASE}/tickets?${qs.toString()}`, { method: 'POST', body: JSON.stringify({ bet_amount: params.betAmount }) })
  if (!res.ok) throw new Error('Failed to create ticket')
  const data = await res.json()
  const parsed = TicketSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid ticket payload')
  return parsed.data as any
}

export async function postDraw(roundId: string): Promise<DrawCompletedPayload> {
  const res = await apiFetch(`${API_BASE}/drawnings?round_id=${encodeURIComponent(roundId)}`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to run draw')
  const data = await res.json()
  const parsed = DrawCompletedSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid draw payload')
  return parsed.data
}

export async function createTodayRound(): Promise<Round> {
  const today = new Date().toISOString().slice(0, 10)
  const res = await apiFetch(`${API_BASE}/rounds?starts_at=${encodeURIComponent(today)}`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to create round')
  return res.json()
}

export async function initDeposit(amount: number, currency: string = 'ETB'): Promise<{ checkout_url: string; tx_ref: string }> {
  const res = await apiFetch(`${API_BASE}/payments/init`, { method: 'POST', body: JSON.stringify({ amount, currency }) })
  if (!res.ok) throw new Error('Failed to init payment')
  return res.json()
}

export async function getCurrentDrawnNumbers(roundId?: string): Promise<number[]> {
  const url = roundId ? `${API_BASE}/drawnings?round_id=${encodeURIComponent(roundId)}` : `${API_BASE}/drawnings`
  const res = await apiFetch(url)
  if (res.status === 204) return []
  if (!res.ok) throw new Error('Failed to fetch drawning')
  const data = await res.json() as { drawn_number?: number[] }
  return Array.isArray(data.drawn_number) ? data.drawn_number : []
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

