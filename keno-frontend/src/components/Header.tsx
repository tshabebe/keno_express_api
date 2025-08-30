import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { initDeposit, getCurrentDrawnNumbers } from '../lib/api'
import { getSocket, onDrawNumber, offDrawNumber, onPhaseTick, offPhaseTick, type DrawNumberEvent, type PhaseTickEvent } from '../lib/socket'

export default function Header() {
  const { user, balance } = useAuth()
  const navigate = useNavigate()
  const [remainingMs, setRemainingMs] = useState<number>(0)
  const [lastNumber, setLastNumber] = useState<number | null>(null)
  const [phase, setPhase] = useState<'select' | 'draw'>('select')
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    // hydrate last number on load
    ;(async () => {
      try {
        const already = await getCurrentDrawnNumbers()
        if (already?.length) setLastNumber(already[already.length - 1]!)
      } catch {}
    })()

    const s = getSocket()
    // track phase updates for countdown
    const onPhase = (p: { status: 'select' | 'draw'; phaseEndsAt: string | Date }) => {
      setPhase(p.status)
      if (timerRef.current) window.clearInterval(timerRef.current)
      if (p.status === 'select') {
        const target = p?.phaseEndsAt ? new Date(p.phaseEndsAt).getTime() : 0
        if (target > 0) {
          const tick = () => {
            const now = Date.now()
            setRemainingMs(Math.max(0, target - now))
          }
          tick()
          timerRef.current = window.setInterval(tick, 250)
        } else {
          setRemainingMs(0)
        }
      } else {
        // during draw we stop the countdown
        setRemainingMs(0)
      }
    }
    s.on('phase:update', onPhase)
    const onTick = (t: PhaseTickEvent) => {
      if (t?.status) setPhase(t.status as 'select' | 'draw')
      if (t?.status === 'select' && t.phaseEndsAt) {
        const target = new Date(t.phaseEndsAt).getTime()
        setRemainingMs(Math.max(0, target - (t.now ? new Date(t.now as any).getTime() : Date.now())))
      }
      if (t?.status === 'draw') setRemainingMs(0)
    }
    onPhaseTick(onTick)

    // latest called number
    const handleNumber = (e: DrawNumberEvent) => {
      setLastNumber(e.number)
    }
    onDrawNumber(handleNumber)

    return () => {
      s.off('phase:update', onPhase)
      offPhaseTick(onTick)
      offDrawNumber(handleNumber)
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  const mm = String(Math.floor(remainingMs / 1000 / 60)).padStart(2, '0')
  const ss = String(Math.floor((remainingMs / 1000) % 60)).padStart(2, '0')

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3" />

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="rounded-xl border border-indigo-300/20 bg-gradient-to-b from-indigo-600 to-indigo-700 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-900/30 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:from-indigo-500 hover:to-indigo-600 hover:shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
          onClick={() => navigate('/payments')}
        >
          Add Funds
        </button>

        {/* Countdown (select) or Drawing indicator (draw) and last called number */}
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/50 px-3 py-2 shadow-xl backdrop-blur-xl">
          {phase === 'select' ? (
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-100">
              <span aria-hidden>🕒</span>
              <span>{mm}:{ss}</span>
            </div>
          ) : (
            <div className="text-sm font-semibold text-slate-200">Drawing…</div>
          )}
          {lastNumber !== null && (
            <div className="grid h-8 w-8 place-items-center rounded-full border border-amber-300/30 bg-gradient-to-b from-amber-400 to-amber-500 text-amber-950 text-sm font-extrabold shadow-md shadow-amber-900/30">
              {lastNumber}
            </div>
          )}
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/50 shadow-xl backdrop-blur-xl px-3 py-2 text-sm">
          Balance: <span className="font-semibold text-slate-100">${balance.toFixed(2)}</span>
        </div>
        {user && <span className="text-xs text-slate-300/90">{user.displayName}</span>}
      </div>
    </div>
  )
}

