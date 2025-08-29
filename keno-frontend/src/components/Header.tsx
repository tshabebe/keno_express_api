import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { initDeposit, getSession } from '../lib/api'
import { onDrawNumber, offDrawNumber, getSocket } from '../lib/socket'

export default function Header() {
  const { balance } = useAuth()
  const [phaseEndsAt, setPhaseEndsAt] = useState<number | null>(null)
  const [nowTs, setNowTs] = useState<number>(Date.now())
  const [lastNumber, setLastNumber] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    getSession().then((s) => {
      if (!mounted) return
      if (s?.phase_ends_at) setPhaseEndsAt(new Date(s.phase_ends_at).getTime())
    }).catch(() => {})

    const id = window.setInterval(() => setNowTs(Date.now()), 1000)

    const handleNumber = (e: { number: number }) => setLastNumber(e.number)
    onDrawNumber(handleNumber)

    const s = getSocket()
    const onPhase = (p: { phaseEndsAt: string | Date }) => {
      const t = typeof p.phaseEndsAt === 'string' ? new Date(p.phaseEndsAt).getTime() : new Date(p.phaseEndsAt).getTime()
      setPhaseEndsAt(t)
    }
    s.on('phase:update', onPhase)

    return () => {
      mounted = false
      window.clearInterval(id)
      offDrawNumber(handleNumber)
      s.off('phase:update', onPhase)
    }
  }, [])

  const remaining = phaseEndsAt ? Math.max(0, phaseEndsAt - nowTs) : 0
  const mm = String(Math.floor(remaining / 60000)).padStart(2, '0')
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/50 shadow-xl backdrop-blur-xl px-3 py-2 text-sm">
          Balance: <span className="font-semibold text-slate-100">${balance.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100">
            <span className="mr-1">🕒</span>{mm}:{ss}
          </div>
          {lastNumber !== null ? (
            <div className="grid h-8 w-8 place-items-center rounded-full bg-amber-500 text-slate-950 text-base font-extrabold">
              {lastNumber}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 focus:outline-none"
          onClick={async () => {
            try {
              const { checkout_url } = await initDeposit(50, 'ETB')
              if (checkout_url) window.location.href = checkout_url
            } catch (e) {
              console.error(e)
            }
          }}
        >
          Add Funds
        </button>
      </div>
    </div>
  )
}

