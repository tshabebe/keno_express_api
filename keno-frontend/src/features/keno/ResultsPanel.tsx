type ResultsPanelProps = {
  drawnNumbers: number[]
  selectedNumbers: number[]
  isDrawing: boolean
}

import { useEffect, useRef, useState } from 'react'

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
      setVisible(drawnNumbers.slice(0, i))
      i += 1
      if (i <= drawnNumbers.length) {
        timerRef.current = window.setTimeout(step, 250)
      }
    }
    step()
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [drawnNumbers.join(',')])

  return (
    <section className="rounded-lg bg-slate-900 p-3 sm:p-4" aria-live="polite">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Results</h2>
        <span className="text-xs text-slate-400">{matches.length} match{matches.length === 1 ? '' : 'es'}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" aria-live="polite">
        {visible.length === 0 ? (
          <span className="text-xs text-slate-500">No draws yet</span>
        ) : (
          visible.map((num, idx) => {
            const isHit = selectedNumbers.includes(num)
            const base = 'rounded-md px-2 py-1 text-xs font-semibold'
            const style = isHit ? 'bg-emerald-800 text-emerald-50' : 'bg-slate-800 text-slate-200'
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

