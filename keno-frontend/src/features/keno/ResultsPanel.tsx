type ResultsPanelProps = {
  drawnNumbers: number[]
  selectedNumbers: number[]
  isDrawing: boolean
}

export default function ResultsPanel({ drawnNumbers, selectedNumbers, isDrawing }: ResultsPanelProps) {
  const matches = selectedNumbers.filter((n) => drawnNumbers.includes(n))

  return (
    <section className="rounded-lg bg-slate-900 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Results</h2>
        <span className="text-xs text-slate-400">{matches.length} match{matches.length === 1 ? '' : 'es'}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" aria-live="polite">
        {drawnNumbers.length === 0 ? (
          <span className="text-xs text-slate-500">No draws yet</span>
        ) : (
          drawnNumbers.map((num, idx) => {
            const isHit = selectedNumbers.includes(num)
            const base = 'rounded-md px-2 py-1 text-xs font-semibold'
            const style = isHit ? 'bg-emerald-800 text-emerald-50' : 'bg-slate-800 text-slate-200'
            return (
              <span
                key={`${num}-${idx}`}
                className={`${base} ${style}`}
                style={{ transition: 'opacity 200ms ease', opacity: isDrawing ? 0.7 : 1 }}
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

