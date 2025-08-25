import { apiFetch, setAuthToken } from './http'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export type AuthResponse = { token: string; user: { id: string; email: string; displayName: string } }

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

export function logout() {
  setAuthToken(null)
  localStorage.removeItem('auth')
}

