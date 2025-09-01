type ResultsPanelProps = {
  drawnNumbers: number[]
  selectedNumbers: number[]
  isDrawing: boolean
}

import { useEffect, useRef, useState } from 'react'
import { playCall, playHit } from '../../lib/sound'

export default function ResultsPanel({ drawnNumbers, selectedNumbers, isDrawing }: ResultsPanelProps) {
  const [visible, setVisible] = useState<number[]>([])
  const timerRef = useRef<number | null>(null)
  const matches = selectedNumbers.filter((n) => visible.includes(n))

  useEffect(() => {
    // Animate number reveal when a new draw arrives
    if (drawnNumbers.length === 0) {
      setVisible([])
      return
    }
    setVisible([])
    let i = 0
    const step = () => {
      const next = drawnNumbers[i]
      if (typeof next === 'number') {
        setVisible(drawnNumbers.slice(0, i + 1))
        // play soft call sound for each revealed number
        playCall()
        // distinct sound if it's a hit
        if (selectedNumbers.includes(next)) {
          playHit()
        }
      }
      i += 1
      if (i <= drawnNumbers.length - 1) {
        timerRef.current = window.setTimeout(step, 250)
      }
    }
    step()
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [drawnNumbers.join(',')])

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/50 shadow-xl backdrop-blur-xl p-3 sm:p-4" aria-live="polite">
      <div aria-hidden className="glow-emerald -top-14 -right-16 h-40 w-40"></div>
      <div aria-hidden className="glow-indigo -bottom-14 -left-16 h-40 w-40"></div>
      <div className="relative flex items-center justify-between">
        <h2 className="bg-gradient-to-r from-emerald-300 to-indigo-300 bg-clip-text text-transparent text-sm font-semibold">Results</h2>
        <span className="text-xs text-slate-300/90">{matches.length} match{matches.length === 1 ? '' : 'es'}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" aria-live="polite">
        {visible.length === 0 ? (
          <span className="text-xs text-slate-400/80">No draws yet</span>
        ) : (
          visible.map((num, idx) => {
            const isHit = selectedNumbers.includes(num)
            const base = 'rounded-lg border px-2 py-1 text-xs font-semibold transition-transform duration-200 ease-out hover:-translate-y-0.5'
            const style = isHit
              ? 'border-emerald-300/20 bg-gradient-to-b from-emerald-700 to-emerald-800/90 text-emerald-50 shadow-sm shadow-emerald-900/40'
              : 'border-white/10 bg-slate-800/80 text-slate-100 shadow-sm'
            return (
              <span
                key={`${num}-${idx}`}
                className={`${base} ${style}`}
                style={{ transition: 'opacity 200ms ease', opacity: isDrawing ? 0.9 : 1 }}
              >
                {num}
              </span>
            )
          })
        )}
      </div>
    </section>
  )
}

