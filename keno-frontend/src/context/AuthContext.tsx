import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthResponse } from '../lib/auth'
import { login, logout, register, restoreAuth } from '../lib/auth'

type AuthContextType = {
  user: AuthResponse['user'] | null
  token: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const restored = restoreAuth()
    if (restored) {
      setUser(restored.user)
      setToken(restored.token)
    }
  }, [])

  const value = useMemo<AuthContextType>(() => ({
    user,
    token,
    async signIn(email: string, password: string) {
      const data = await login({ email, password })
      setUser(data.user)
      setToken(data.token)
    },
    async signUp(email: string, password: string, displayName?: string) {
      const data = await register({ email, password, displayName })
      setUser(data.user)
      setToken(data.token)
    },
    signOut() {
      logout()
      setUser(null)
      setToken(null)
    },
  }), [user, token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

