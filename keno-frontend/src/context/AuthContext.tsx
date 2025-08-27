import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { AuthResponse } from '../lib/auth'
import { getMe, restoreAuth } from '../lib/auth'
import { setAuthToken } from '../lib/http'

type AuthContextType = {
  user: AuthResponse['user'] | null
  token: string | null
  balance: number
  setBalance: (value: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const location = useLocation()

  useEffect(() => {
    const restored = restoreAuth()
    if (restored) {
      setUser(restored.user)
      setToken(restored.token)
      setBalance(restored.user.balance ?? 0)
      setAuthToken(restored.token)
    }
  }, [])

  // Accept token from URL (?token=...); set as active auth and fetch profile
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tokenFromUrl = params.get('token')
    if (tokenFromUrl && tokenFromUrl !== token) {
      setToken(tokenFromUrl)
      setAuthToken(tokenFromUrl)
      ;(async () => {
        try {
          const me = await getMe()
          if (me) {
            setUser({ id: me.id as any, email: me.email, displayName: me.displayName } as any)
            setBalance(me.balance ?? 0)
            localStorage.setItem('auth', JSON.stringify({ token: tokenFromUrl, user: { id: me.id, email: me.email, displayName: me.displayName, balance: me.balance } }))
          }
        } catch {
          // ignore
        }
      })()
    }
  }, [location.search])

  const value = useMemo<AuthContextType>(() => ({
    user,
    token,
    balance,
    setBalance,
  }), [user, token, balance])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

