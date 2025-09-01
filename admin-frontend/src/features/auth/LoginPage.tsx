import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { login } from '../../lib/auth'
import { useAuth } from '../../context/AuthContext'

const schema = z.object({
  phoneNumber: z.string().min(8, 'Enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phoneNumber: '', password: '' },
    mode: 'onTouched',
  })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    setLoading(true)
    try {
      const auth = await login(values)
      setSession(auth)
      navigate('/keno')
    } catch (e: any) {
      setError(e?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 grid place-items-center px-4 relative overflow-hidden">
      <div aria-hidden className="glow-emerald -top-20 -right-24 h-56 w-56"></div>
      <div aria-hidden className="glow-indigo -bottom-24 -left-24 h-56 w-56"></div>
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/50 shadow-xl backdrop-blur-xl p-8">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-300 to-indigo-300 bg-clip-text text-transparent">Welcome back</div>
            <div className="text-slate-300 text-sm mt-1">Sign in to continue</div>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200">Phone number</label>
              <div className="mt-1 relative">
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="e.g. +1234567890"
                  { ...register('phoneNumber') }
                  className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder:text-slate-400 shadow-inner backdrop-blur-md transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-emerald-400/30"
                />
              </div>
              {errors.phoneNumber ? <div className="text-xs text-red-400 mt-1">{errors.phoneNumber.message}</div> : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">Password</label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  placeholder="Your password"
                  { ...register('password') }
                  className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder:text-slate-400 shadow-inner backdrop-blur-md transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-emerald-400/30"
                />
              </div>
              {errors.password ? <div className="text-xs text-red-400 mt-1">{errors.password.message}</div> : null}
            </div>
            {error ? <div className="text-sm text-red-400">{error}</div> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border border-indigo-300/20 bg-gradient-to-b from-indigo-600 to-indigo-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-900/30 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:from-indigo-500 hover:to-indigo-600 hover:shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <div className="text-center text-slate-400 text-xs mt-6 space-y-1">
          <div>By signing in, you agree to our Terms of Service and Privacy Policy.</div>
          <div>
            New here? <Link to="/register" className="text-indigo-300 hover:text-indigo-200">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

