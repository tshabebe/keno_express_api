import { apiFetch, setAuthToken } from './http'
import { getApiBaseUrl } from './env'
import type { AuthResponse } from 'shared/types/auth'

const API_BASE = getApiBaseUrl()

export type { AuthResponse }

export async function register(params: { email: string; password: string; displayName?: string }): Promise<AuthResponse> {
  const res = await apiFetch(`${API_BASE}/auth/register`, { method: 'POST', body: JSON.stringify(params) })
  if (!res.ok) throw new Error('Failed to register')
  const data = (await res.json()) as AuthResponse
  setAuthToken(data.token)
  localStorage.setItem('auth', JSON.stringify(data))
  return data
}

export async function login(params: { email: string; password: string }): Promise<AuthResponse> {
  const res = await apiFetch(`${API_BASE}/auth/login`, { method: 'POST', body: JSON.stringify(params) })
  if (!res.ok) throw new Error('Failed to login')
  const data = (await res.json()) as AuthResponse
  setAuthToken(data.token)
  localStorage.setItem('auth', JSON.stringify(data))
  return data
}

export function restoreAuth(): AuthResponse | null {
  try {
    const raw = localStorage.getItem('auth')
    if (!raw) return null
    const data = JSON.parse(raw) as AuthResponse
    setAuthToken(data.token)
    return data
  } catch {
    return null
  }
}

export async function getMe(): Promise<{ id: string; email: string; displayName: string; balance: number } | null> {
  const res = await apiFetch(`${API_BASE}/me`)
  if (res.status === 401) return null
  if (!res.ok) throw new Error('Failed to load profile')
  return res.json()
}

