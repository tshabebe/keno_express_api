import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { register as registerUser } from '../../lib/auth'
import { useAuth } from '../../context/AuthContext'

const schema = z.object({
  phoneNumber: z.string().min(8, 'Enter a valid phone number'),
  displayName: z.string().min(2, 'Enter a display name').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phoneNumber: '', displayName: '', password: '' },
    mode: 'onTouched',
  })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    setLoading(true)
    try {
      const auth = await registerUser(values)
      setSession(auth)
      navigate('/keno')
    } catch (e: any) {
      setError(e?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 grid place-items-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-white tracking-tight">Create account</div>
            <div className="text-slate-300 text-sm mt-1">Join and start playing</div>
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
            </div>
            {/* Email removed */}
            <div>
              <label className="block text-sm font-medium text-slate-200">Display name</label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  placeholder="Your name"
                  { ...register('displayName') }
                  className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">Password</label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  placeholder="Create a password"
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
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </form>
        </div>
        <div className="text-center text-slate-400 text-xs mt-6">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
        </div>
      </div>
    </div>
  )
}


