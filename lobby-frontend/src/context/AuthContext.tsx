import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthResponse } from '../lib/auth'
import { restoreAuth } from '../lib/auth'
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
    const restored = restoreAuth()
    if (restored) {
      setUser(restored.user)
      setToken(restored.token)
      setBalance(restored.user.balance ?? 0)
      setAuthToken(restored.token)
    }
  }, [])

  // URL token handling removed; rely on local login/register only

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

