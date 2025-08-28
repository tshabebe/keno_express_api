import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/http'
import { getApiBaseUrl } from '../../lib/env'

const API_BASE = getApiBaseUrl()

const PhoneSchema = z.string().trim().regex(/^\+?[1-9]\d{6,14}$/, 'Enter a valid phone number')
const FormSchema = z.object({
  phone_number: PhoneSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormValues = z.infer<typeof FormSchema>

export default function LoginPage() {
  const { setAuth } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(FormSchema), mode: 'onBlur' })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await apiFetch(`${API_BASE}/auth/login-phone`, { method: 'POST', body: JSON.stringify(values) })
      if (!res.ok) throw new Error('Invalid credentials')
      const data = await res.json()
      setAuth(data)
    } catch (e: any) {
      setError(e?.message || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="w-full max-w-sm rounded-xl bg-slate-900/80 backdrop-blur border border-slate-800 shadow-xl p-6">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-emerald-700/20 grid place-items-center">
            <span className="text-emerald-400 text-xl">◆</span>
          </div>
          <h1 className="text-lg font-semibold text-slate-100">Welcome back</h1>
          <p className="text-xs text-slate-400">Sign in to continue playing</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-3">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-slate-300">Phone number</label>
            <input
              type="tel"
              inputMode="tel"
              placeholder="+15551234567"
              className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              {...register('phone_number')}
            />
            {errors.phone_number && <span className="text-xs text-rose-400">{errors.phone_number.message}</span>}
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-slate-300">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              {...register('password')}
            />
            {errors.password && <span className="text-xs text-rose-400">{errors.password.message}</span>}
          </div>

          {error && <div className="rounded-md bg-rose-950/60 border border-rose-900 px-3 py-2 text-xs text-rose-300">{error}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-50 disabled:bg-emerald-900 disabled:text-emerald-300"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-[11px] text-center text-slate-500">By continuing, you agree to our Terms and Privacy Policy.</p>
        </form>
      </div>
    </div>
  )
}

