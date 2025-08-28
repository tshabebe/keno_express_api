type KenoBoardProps = {
  selectedNumbers: number[]
  onToggleNumber: (value: number) => void
  maxPicks: number
  drawnNumbers: number[]
}

const TOTAL_NUMBERS = 80

export default function KenoBoard({ selectedNumbers, onToggleNumber, maxPicks, drawnNumbers }: KenoBoardProps) {
  const numbers = Array.from({ length: TOTAL_NUMBERS }, (_, idx) => idx + 1)

  const isAtPickLimit = selectedNumbers.length >= maxPicks

  return (
    <section aria-label="Keno board" className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/50 shadow-xl backdrop-blur-xl p-3 sm:p-4" role="grid">
      <div aria-hidden className="glow-emerald -top-16 -right-20 h-44 w-44"></div>
      <div aria-hidden className="glow-indigo -bottom-16 -left-20 h-44 w-44"></div>
      <div className="relative flex items-center justify-between">
        <h2 className="bg-gradient-to-r from-emerald-300 to-indigo-300 bg-clip-text text-transparent text-sm font-semibold">Pick your numbers</h2>
        <span className="text-xs text-slate-300/90">{selectedNumbers.length}/{maxPicks}</span>
      </div>
      <div className="mt-3 grid grid-cols-10 gap-1.5 sm:gap-2">
        {numbers.map((num) => {
          const isSelected = selectedNumbers.includes(num)
          const isDrawn = drawnNumbers.includes(num)
          const isMatch = isDrawn && isSelected
          const isDisabled = isAtPickLimit && !isSelected
          const base = 'grid place-items-center rounded-lg text-sm font-semibold h-8 w-8 sm:h-10 sm:w-10 border transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-emerald-400/40'
          const match = 'border-amber-300/30 bg-gradient-to-b from-amber-400 to-amber-500 text-amber-950 shadow-md shadow-amber-900/30 ring-amber-300/40'
          const drawn = 'border-amber-300/20 bg-amber-900/40 text-amber-200'
          const selected = 'border-emerald-300/20 bg-gradient-to-b from-emerald-600 to-emerald-700 text-emerald-50 shadow-md shadow-emerald-900/30 hover:-translate-y-0.5'
          const idle = 'border-white/10 bg-slate-800/80 text-slate-100 hover:-translate-y-0.5'
          const disabled = 'border-white/5 bg-slate-800/60 text-slate-500 cursor-not-allowed'
          const className = `${base} ${isMatch ? match : isDrawn ? drawn : isSelected ? selected : isDisabled ? disabled : idle}`

          return (
            <button
              key={num}
              type="button"
              aria-pressed={isSelected}
              aria-label={`Number ${num}`}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => onToggleNumber(num)}
              className={className}
            >
              {num}
            </button>
          )
        })}
      </div>
    </section>
  )
}

