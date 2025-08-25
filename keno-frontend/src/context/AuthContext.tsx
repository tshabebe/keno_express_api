import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthResponse } from '../lib/auth'
import { login, logout, register, restoreAuth } from '../lib/auth'

type AuthContextType = {
  user: AuthResponse['user'] | null
  token: string | null
  balance: number
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signOut: () => void
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
    }
  }, [])

  const value = useMemo<AuthContextType>(() => ({
    user,
    token,
    balance,
    async signIn(email: string, password: string) {
      const data = await login({ email, password })
      setUser(data.user)
      setToken(data.token)
      setBalance(data.user.balance ?? 0)
    },
    async signUp(email: string, password: string, displayName?: string) {
      const data = await register({ email, password, displayName })
      setUser(data.user)
      setToken(data.token)
      setBalance(data.user.balance ?? 0)
    },
    signOut() {
      logout()
      setUser(null)
      setToken(null)
      setBalance(0)
    },
  }), [user, token, balance])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

