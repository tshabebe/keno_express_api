let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(init?.headers || {})
  headers.set('Content-Type', 'application/json')
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`)
  return fetch(input, { cache: 'no-store', ...init, headers })
}

