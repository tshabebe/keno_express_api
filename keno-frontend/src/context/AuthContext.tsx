import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthResponse } from '../lib/auth'
import { restoreAuth, getMe } from '../lib/auth'
import { setAuthToken } from '../lib/http'

type AuthContextType = {
  user: AuthResponse['user'] | null
  token: string | null
  balance: number
  setBalance: (value: number) => void
  setSession: (auth: AuthResponse) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [balance, setBalance] = useState<number>(0)

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const urlToken = params.get('token')
        if (urlToken) {
          setAuthToken(urlToken)
          const me = await getMe().catch(() => null)
          if (me) {
            const auth: AuthResponse = { token: urlToken, user: { id: me.id, displayName: me.displayName, balance: me.balance } }
            setUser(auth.user)
            setToken(auth.token)
            setBalance(auth.user.balance ?? 0)
            try { localStorage.setItem('auth', JSON.stringify(auth)) } catch {}
          }
          // clean token from URL
          try { window.history.replaceState({}, document.title, window.location.pathname) } catch {}
          return
        }
      } catch {}

      const restored = restoreAuth()
      if (restored) {
        setUser(restored.user)
        setToken(restored.token)
        setBalance(restored.user.balance ?? 0)
        setAuthToken(restored.token)
      }
    })()
  }, [])

  const setSession = (auth: AuthResponse) => {
    setUser(auth.user)
    setToken(auth.token)
    setBalance(auth.user.balance ?? 0)
    setAuthToken(auth.token)
    try { localStorage.setItem('auth', JSON.stringify(auth)) } catch {}
  }

  const value = useMemo<AuthContextType>(() => ({
    user,
    token,
    balance,
    setBalance,
    setSession,
  }), [user, token, balance])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

