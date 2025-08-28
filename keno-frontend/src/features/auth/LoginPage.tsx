import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { setAuthToken } from '../../lib/http'

const schema = z.object({
  phoneNumber: z.string().min(8, 'Enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
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
      const res = await fetch(`${location.origin.replace(/:\\d+$/, '')}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || 'Login failed')
      }
      const data = await res.json()
      setAuthToken(data.token)
      localStorage.setItem('auth', JSON.stringify(data))
      navigate('/keno')
    } catch (e: any) {
      setError(e?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 grid place-items-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-white tracking-tight">Welcome back</div>
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
                  className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {errors.password ? <div className="text-xs text-red-400 mt-1">{errors.password.message}</div> : null}
            </div>
            {error ? <div className="text-sm text-red-400">{error}</div> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 text-white font-semibold px-4 py-3 transition disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <div className="text-center text-slate-400 text-xs mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  )
}

