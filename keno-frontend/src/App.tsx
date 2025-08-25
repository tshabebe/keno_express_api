import { useEffect, useMemo, useState } from 'react'
import Layout from './components/Layout'
import KenoBoard from './features/keno/KenoBoard'
import BetControls from './features/keno/BetControls'
import ResultsPanel from './features/keno/ResultsPanel'
import HistoryPanel from './features/keno/HistoryPanel'
import { createTicket, getRounds, postDraw } from './lib/api'

const MAX_PICKS = 10

export default function App() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [betAmount, setBetAmount] = useState<number>(1)
  const [balance, setBalance] = useState<number>(1000)
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([])
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const [history, setHistory] = useState<any[]>([])
  const [currentRoundId, setCurrentRoundId] = useState<string>('')

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

  const isPlaceBetDisabled = useMemo(() => selectedNumbers.length < 5 || betAmount <= 0, [selectedNumbers.length, betAmount])

  const onPlaceBet = async () => {
    if (selectedNumbers.length < 5 || betAmount <= 0) return
    try {
      if (!currentRoundId) {
        const rounds = await getRounds()
        if (rounds.length > 0) setCurrentRoundId(rounds[0]._id)
      }
      const roundId = currentRoundId || (await getRounds())[0]?._id || ''
      if (!roundId) return
      await createTicket({ roundId, numbers: selectedNumbers.slice(0, 10) })
      setIsDrawing(true)
      const res = await postDraw(roundId)
      const drawn = res.drawn.drawn_number || []
      setDrawnNumbers(drawn)
      const hits = selectedNumbers.filter((n) => drawn.includes(n)).length
      const payout = hits > 0 ? betAmount * hits : 0
      setBalance((b) => b - betAmount + payout)
      setHistory((h) => [
        {
          id: crypto.randomUUID(),
          drawn,
          picks: selectedNumbers.slice().sort((a, b) => a - b),
          bet: betAmount,
          payout,
          date: new Date().toISOString(),
        },
        ...h,
      ])
    } finally {
      setIsDrawing(false)
    }
  }

  // load current round once
  useEffect(() => {
    (async () => {
      try {
        const rounds = await getRounds()
        if (rounds.length > 0) setCurrentRoundId(rounds[0]._id)
      } catch {}
    })()
  }, [])

  return (
    <Layout balance={balance}>
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
        </div>
      </div>
    </Layout>
  )
}
