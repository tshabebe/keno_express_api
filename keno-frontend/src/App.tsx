import { useEffect, useMemo, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import KenoBoard from './features/keno/KenoBoard'
import BetControls from './features/keno/BetControls'
import ResultsPanel from './features/keno/ResultsPanel'
import HistoryPanel from './features/keno/HistoryPanel'
import LobbiesPanel from './features/lobbies/LobbiesPanel'
import { createTicket, getCurrentRound, postDraw } from './lib/api'
import { getSocket, joinGlobalKeno, joinRoundRoom } from './lib/socket'
import { useAuth } from './context/AuthContext'
import { getMe } from './lib/auth'

const MAX_PICKS = 10

export default function App() {
  const { user, balance: ctxBalance, setBalance } = useAuth()
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [betAmount, setBetAmount] = useState<number>(1)
  const [, setLocalBalance] = useState<number>(1000)
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([])
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const [history, setHistory] = useState<any[]>([])
  const [currentRoundId, setCurrentRoundId] = useState<string>('')
  const [lastBet, setLastBet] = useState<{ picks: number[]; amount: number } | null>(null)
  const [phaseStatus, setPhaseStatus] = useState<'idle' | 'select' | 'draw'>('idle')

  const onToggleNumber = (value: number) => {
    setSelectedNumbers((prev) =>
      prev.includes(value)
        ? prev.filter((n) => n !== value)
        : prev.length < MAX_PICKS
          ? [...prev, value]
          : prev,
    )
  }

  const onQuickPick = () => {
    const needed = MAX_PICKS - selectedNumbers.length
    if (needed <= 0) return

    const remaining = Array.from({ length: 80 }, (_, i) => i + 1).filter((n) => !selectedNumbers.includes(n))
    const picked: number[] = []
    while (picked.length < needed && remaining.length > 0) {
      const idx = Math.floor(Math.random() * remaining.length)
      picked.push(remaining[idx])
      remaining.splice(idx, 1)
    }
    setSelectedNumbers((prev) => [...prev, ...picked])
  }

  const onClear = () => setSelectedNumbers([])

  const isPlaceBetDisabled = useMemo(() => selectedNumbers.length < 5 || betAmount <= 0 || !user || phaseStatus !== 'select', [selectedNumbers.length, betAmount, user, phaseStatus])

  const onPlaceBet = async () => {
    if (selectedNumbers.length < 5 || betAmount <= 0 || phaseStatus !== 'select') return
    try {
      const roundId = currentRoundId || ''
      if (!roundId) return
      await createTicket({ roundId, numbers: selectedNumbers.slice(0, 10), betAmount })
      setLastBet({ picks: selectedNumbers.slice().sort((a, b) => a - b), amount: betAmount })
      setIsDrawing(true)
      await postDraw(roundId)
    } finally {
      setIsDrawing(false)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const cur = await getCurrentRound()
        if (cur) setCurrentRoundId(cur._id)
      } catch {}
    })()
  }, [])

  useEffect(() => {
    const s = getSocket()
    joinGlobalKeno()
    if (currentRoundId) joinRoundRoom(currentRoundId)

    const onDrawCompleted = async (payload: { drawn: { drawn_number: number[] }; winnings: Array<{ played_number: number[] }> }) => {
      const drawn = payload?.drawn?.drawn_number || []
      setDrawnNumbers(drawn)
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
        setHistory((h) => [
          {
            id: crypto.randomUUID(),
            drawn,
            picks: lastBet.picks,
            bet: lastBet.amount,
            payout,
            date: new Date().toISOString(),
          },
          ...h,
        ])
        setLastBet(null)
      }
    }

    s.on('draw:completed', onDrawCompleted)
    const onPhase = (p: { status: 'select' | 'draw'; phaseEndsAt: string | Date; roundId: string }) => {
      if (p?.roundId) {
        if (p.roundId !== currentRoundId) {
          setCurrentRoundId(p.roundId)
          joinRoundRoom(p.roundId)
        }
      }
      setPhaseStatus(p.status)
    }
    s.on('phase:update', onPhase)

    return () => {
      s.off('draw:completed', onDrawCompleted)
      s.off('phase:update', onPhase)
    }
  }, [currentRoundId, lastBet, ctxBalance])

  const Main = (
    <Layout>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <KenoBoard selectedNumbers={selectedNumbers} onToggleNumber={onToggleNumber} maxPicks={MAX_PICKS} />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ResultsPanel drawnNumbers={drawnNumbers} selectedNumbers={selectedNumbers} isDrawing={isDrawing} />
            <HistoryPanel entries={history} />
          </div>
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
          />
          <div className="mt-4">
            <LobbiesPanel currentRoundId={currentRoundId} />
          </div>
        </div>
      </div>
    </Layout>
  )

  const Loading = (
    <div className="min-h-screen grid place-items-center text-slate-300">
      <div className="text-sm">Loading…</div>
    </div>
  )

  return (
    <Routes>
      <Route path="/" element={user ? Main : Loading} />
      <Route path="/keno" element={user ? Main : Loading} />
    </Routes>
  )
}
