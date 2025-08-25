type KenoBoardProps = {
  selectedNumbers: number[]
  onToggleNumber: (value: number) => void
  maxPicks: number
}

const TOTAL_NUMBERS = 80

export default function KenoBoard({ selectedNumbers, onToggleNumber, maxPicks }: KenoBoardProps) {
  const numbers = Array.from({ length: TOTAL_NUMBERS }, (_, idx) => idx + 1)

  const isAtPickLimit = selectedNumbers.length >= maxPicks

  return (
    <section aria-label="Keno board" className="rounded-lg bg-slate-900 p-3 sm:p-4" role="grid">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Pick your numbers</h2>
        <span className="text-xs text-slate-400">{selectedNumbers.length}/{maxPicks}</span>
      </div>
      <div className="mt-3 grid grid-cols-10 gap-1.5 sm:gap-2">
        {numbers.map((num) => {
          const isSelected = selectedNumbers.includes(num)
          const isDisabled = isAtPickLimit && !isSelected
          const base = 'grid place-items-center rounded-md text-sm font-semibold h-8 w-8 sm:h-10 sm:w-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900'
          const selected = 'bg-emerald-700 text-emerald-50'
          const idle = 'bg-slate-800 text-slate-200'
          const disabled = 'bg-slate-800 text-slate-500 cursor-not-allowed'
          const className = `${base} ${isSelected ? selected : isDisabled ? disabled : idle}`

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

