import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const submit = async () => {
    try {
      setLoading(true)
      setError(null)
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password, displayName)
      }
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-slate-900 p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>

        <div className="mt-3 grid gap-2">
          {mode === 'register' && (
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
              className="rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          />
          {error && <div className="text-xs text-red-400">{error}</div>}
          <button
            onClick={submit}
            disabled={loading}
            className="mt-1 rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-50 disabled:bg-emerald-900 disabled:text-emerald-300"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Sign up'}
          </button>
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-left text-xs text-slate-400 hover:text-slate-200"
          >
            {mode === 'login' ? 'New here? Create an account' : 'Have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}

