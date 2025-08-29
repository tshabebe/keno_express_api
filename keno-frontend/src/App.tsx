import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import Layout from './components/Layout'
import KenoBoard from './features/keno/KenoBoard'
import BetControls from './features/keno/BetControls'
import CalledBalls from './features/keno/CalledBalls'
import LobbiesPanel from './features/lobbies/LobbiesPanel'
import { createTicket, getCurrentRound, getCurrentDrawnNumbers, getSession } from './lib/api'
import { getSocket, joinGlobalKeno, joinRoundRoom, onDrawStart, onDrawNumber, offDrawStart, offDrawNumber, type DrawNumberEvent, type DrawStartEvent } from './lib/socket'
import { useToast } from './context/ToastContext'
import { useAuth } from './context/AuthContext'
import { getMe } from './lib/auth'
import { playRoundStart, playCall, playHit } from './lib/sound'

const MAX_PICKS = 10

export default function App() {
  const { user, balance: ctxBalance, setBalance } = useAuth()
  const { show } = useToast()
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [betAmount, setBetAmount] = useState<number>(1)
  const [, setLocalBalance] = useState<number>(1000)
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([])
  // kept for potential UI state, currently unused
  const [currentRoundId, setCurrentRoundId] = useState<string>('')
  const [lastBet, setLastBet] = useState<{ picks: number[]; amount: number } | null>(null)
  const [phaseStatus, setPhaseStatus] = useState<'idle' | 'select' | 'draw'>('idle')
  const [phaseEndsAt, setPhaseEndsAt] = useState<number | null>(null)
  const [nowTs, setNowTs] = useState<number>(Date.now())
  const [streamNonce, setStreamNonce] = useState<string | null>(null)
  const [lastSeq, setLastSeq] = useState<number>(-1)
  const revealTimersRef = useState<number[]>([])[0] as unknown as { push: (id: number) => void; length: number } & number[]
  const timersRef = (revealTimersRef as unknown as { current?: number[] })
  if (!Array.isArray((timersRef as any).current)) (timersRef as any).current = []

  const onToggleNumber = (value: number) => {
    setSelectedNumbers((prev) =>
      prev.includes(value)
        ? prev.filter((n) => n !== value)
        : prev.length < MAX_PICKS
          ? [...prev, value]
          : prev,
    )
  }

  const onQuickPick = (count?: number) => {
    const need = typeof count === 'number' ? Math.max(0, Math.min(MAX_PICKS, count) - selectedNumbers.length) : (MAX_PICKS - selectedNumbers.length)
    const needed = need
    if (needed <= 0) return

    const remaining = Array.from({ length: 80 }, (_, i) => i + 1).filter((n) => !selectedNumbers.includes(n))
    const picked: number[] = []
    while (picked.length < needed && remaining.length > 0) {
      const idx = Math.floor(Math.random() * remaining.length)
      picked.push(remaining[idx])
      remaining.splice(idx, 1)
    }
    setSelectedNumbers((prev) => {
      const next = [...prev, ...picked]
      try { localStorage.setItem('keno_selected', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const onClear = () => { setSelectedNumbers([]); try { localStorage.removeItem('keno_selected') } catch {} }

  const isPlaceBetDisabled = useMemo(() => selectedNumbers.length < 5 || betAmount <= 0 || !user || phaseStatus !== 'select', [selectedNumbers.length, betAmount, user, phaseStatus])

  const onPlaceBet = async () => {
    if (selectedNumbers.length < 5 || betAmount <= 0 || phaseStatus !== 'select') return
    try {
      const roundId = currentRoundId || ''
      if (!roundId) return
      await createTicket({ roundId, numbers: selectedNumbers.slice(0, 10), betAmount })
      setLastBet({ picks: selectedNumbers.slice().sort((a, b) => a - b), amount: betAmount })
      try { localStorage.setItem('keno_selected', JSON.stringify(selectedNumbers)) } catch {}
      // No manual draw trigger; server will broadcast automatically
      show('Bet placed for next draw', 'success')
    } finally {
      // keep state; ResultsPanel handles animation when draw event arrives
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const cur = await getCurrentRound()
        if (cur) setCurrentRoundId(cur._id)
        // hydrate already-drawn numbers for persistence across reloads
        const stored = (() => {
          try {
            if (!cur?._id) return null
            const raw = localStorage.getItem(`keno_draw_${cur._id}`)
            return raw ? (JSON.parse(raw) as { numbers?: number[]; lastSeq?: number }) : null
          } catch {
            return null
          }
        })()
        // hydrate selected numbers
        try {
          const selRaw = localStorage.getItem('keno_selected')
          const sel = selRaw ? (JSON.parse(selRaw) as number[]) : []
          if (Array.isArray(sel) && sel.length) setSelectedNumbers(sel)
        } catch {}
        if (stored?.numbers?.length) {
          setDrawnNumbers(stored.numbers)
          if (typeof stored.lastSeq === 'number') setLastSeq(stored.lastSeq)
        } else {
          const already = await getCurrentDrawnNumbers(cur?._id)
          if (already && already.length > 0) setDrawnNumbers(already)
        }
        const sess = await getSession()
        if (sess?.phase_ends_at) setPhaseEndsAt(new Date(sess.phase_ends_at).getTime())
      } catch {}
    })()
  }, [])

  // live ticking countdown
  useEffect(() => {
    const id = window.setInterval(() => setNowTs(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const s = getSocket()
    joinGlobalKeno()
    if (currentRoundId) joinRoundRoom(currentRoundId)

    const onDrawCompleted = async (payload: { drawn: { drawn_number: number[] }; winnings: Array<{ played_number: number[] }> }) => {
      const drawn = payload?.drawn?.drawn_number || []
      // Clear any previous reveal timers and start fresh
      try {
        const ids = (timersRef as any).current as number[]
        ids.forEach((id: number) => window.clearTimeout(id))
        ;(timersRef as any).current = []
      } catch {}
      setDrawnNumbers([])
      const intervalMs = 500; // slower reveal for a more relaxed feel
      drawn.forEach((num, idx) => {
        const tid = window.setTimeout(() => {
          setDrawnNumbers((prev) => (prev.includes(num) ? prev : [...prev, num]))
          if (selectedNumbers.includes(num)) playHit(); else playCall()
        }, idx * intervalMs)
        ;(timersRef as any).current.push(tid)
      })
      if (lastBet) {
        const hits = lastBet.picks.filter((n) => drawn.includes(n)).length
        const payout = hits >= 5 ? lastBet.amount * hits : 0
        try {
          const me = await getMe()
          if (me) {
            setLocalBalance(me.balance)
            setBalance(me.balance)
          } else {
            setLocalBalance((b) => b - lastBet.amount + payout)
            setBalance((ctxBalance || 0) - lastBet.amount + payout)
          }
        } catch {
          setLocalBalance((b) => b - lastBet.amount + payout)
          setBalance((ctxBalance || 0) - lastBet.amount + payout)
        }
        setLastBet(null)
      }
    }

    s.on('draw:completed', onDrawCompleted)
    const seen = new Set<number>()
    const handleStart = (e: DrawStartEvent) => {
      // optional: verify sig/nonce server trust; client can also track to prevent replay in session
      seen.clear()
      setDrawnNumbers([])
      setStreamNonce(e.nonce || null)
      setLastSeq(-1)
      if (currentRoundId) localStorage.removeItem(`keno_draw_${currentRoundId}`)
    }
    const handleNumber = (e: DrawNumberEvent) => {
      // Bind to stream nonce lazily if we missed draw:start
      if (!streamNonce) setStreamNonce(e.nonce)
      if (streamNonce && e.nonce !== streamNonce) return

      // Ignore duplicates or out-of-order old events
      if (lastSeq >= 0 && typeof e.seq === 'number' && e.seq <= lastSeq) return

      // Sequence gap detected: resync to up-to-seq state
      if (lastSeq >= 0 && typeof e.seq === 'number' && e.seq > lastSeq + 1) {
        if (currentRoundId) {
          getCurrentDrawnNumbers(currentRoundId)
            .then((nums) => {
              if (Array.isArray(nums) && nums.length) {
                const upto = nums.slice(0, e.seq + 1)
                setDrawnNumbers(upto)
                setLastSeq(e.seq)
                try { localStorage.setItem(`keno_draw_${currentRoundId}`, JSON.stringify({ numbers: upto, lastSeq: e.seq })) } catch {}
              }
            })
            .catch(() => {})
        }
      }

      if (seen.has(e.number)) return
      seen.add(e.number)

      setDrawnNumbers((prev) => {
        const next = prev.includes(e.number) ? prev : [...prev, e.number]
        if (currentRoundId) {
          try { localStorage.setItem(`keno_draw_${currentRoundId}`, JSON.stringify({ numbers: next, lastSeq: e.seq })) } catch {}
        }
        return next
      })
      setLastSeq(e.seq)
      if (selectedNumbers.includes(e.number)) playHit(); else playCall()
    }
    onDrawStart(handleStart)
    onDrawNumber(handleNumber)
    const onPhase = (p: { status: 'select' | 'draw'; phaseEndsAt: string | Date; roundId: string }) => {
      if (p?.roundId) {
        if (p.roundId !== currentRoundId) {
          setCurrentRoundId(p.roundId)
          joinRoundRoom(p.roundId)
          // New round announced
          playRoundStart()
        }
      }
      setPhaseStatus(p.status)
      setPhaseEndsAt(typeof p.phaseEndsAt === 'string' ? new Date(p.phaseEndsAt).getTime() : new Date(p.phaseEndsAt).getTime())
    }
    s.on('phase:update', onPhase)

    return () => {
      s.off('draw:completed', onDrawCompleted)
      s.off('phase:update', onPhase)
      offDrawStart(handleStart)
      offDrawNumber(handleNumber)
    }
  }, [currentRoundId, lastBet, ctxBalance])

  const Main = (
    <Layout>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Mobile: called balls above grid */}
          <div className="lg:hidden">
            <CalledBalls numbers={[...drawnNumbers].slice(0, 20)} countdownMs={phaseEndsAt ? Math.max(0, phaseEndsAt - nowTs) : undefined} />
          </div>
          <KenoBoard selectedNumbers={selectedNumbers} onToggleNumber={onToggleNumber} maxPicks={MAX_PICKS} drawnNumbers={drawnNumbers} />
        </div>
        <div className="lg:col-span-1">
          <BetControls
            selectedNumbers={selectedNumbers}
            maxPicks={MAX_PICKS}
            betAmount={betAmount}
            onBetAmountChange={setBetAmount}
            onQuickPick={onQuickPick}
            onClear={onClear}
            onPlaceBet={onPlaceBet}
            isPlaceBetDisabled={isPlaceBetDisabled}
            lastBet={lastBet}
            onRebet={() => {
              if (!lastBet || !currentRoundId) return
              createTicket({ roundId: currentRoundId, numbers: lastBet.picks, betAmount: lastBet.amount })
                .then(() => show('Rebet placed', 'success'))
                .catch((e) => show(e?.message || 'Rebet failed', 'error'))
            }}
          />
          <div className="mt-4">
            <LobbiesPanel />
          </div>
          {/* Desktop: called balls under bet controls */}
          <div className="mt-4 hidden lg:block">
            <CalledBalls numbers={[...drawnNumbers].slice(0, 20)} countdownMs={phaseEndsAt ? Math.max(0, phaseEndsAt - nowTs) : undefined} />
          </div>
        </div>
      </div>
    </Layout>
  )

  // removed unused Loading view; login route handles unauthenticated state

  return (
    <Routes>
      <Route path="/" element={user ? Main : <Navigate to="/login" replace />} />
      <Route path="/keno" element={user ? Main : <Navigate to="/login" replace />} />
      <Route path="/login" element={user ? <Navigate to="/keno" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/keno" replace /> : <RegisterPage />} />
    </Routes>
  )
}
