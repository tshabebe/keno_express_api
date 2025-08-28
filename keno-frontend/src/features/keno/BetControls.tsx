type BetControlsProps = {
  selectedNumbers: number[]
  maxPicks: number
  betAmount: number
  onBetAmountChange: (value: number) => void
  onQuickPick: (count?: number) => void
  onClear: () => void
  onPlaceBet: () => void
  isPlaceBetDisabled?: boolean
  lastBet?: { picks: number[]; amount: number } | null
  onRebet?: () => void
}

export default function BetControls({
  selectedNumbers,
  maxPicks,
  betAmount,
  onBetAmountChange,
  onQuickPick,
  onClear,
  onPlaceBet,
  isPlaceBetDisabled,
  lastBet,
  onRebet,
}: BetControlsProps) {
  return (
    <aside className="rounded-lg bg-slate-900 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Your bet</h2>
        <span className="text-xs text-slate-400">{selectedNumbers.length}/{maxPicks} picks</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" aria-live="polite">
        {selectedNumbers.length === 0 ? (
          <span className="text-xs text-slate-500">No numbers selected</span>
        ) : (
          selectedNumbers
            .slice()
            .sort((a, b) => a - b)
            .map((num) => (
              <span key={num} className="rounded-md bg-emerald-800 px-2 py-1 text-xs font-semibold text-emerald-50">
                {num}
              </span>
            ))
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <div className="grid grid-cols-1 gap-2">
          <input
            aria-label="Bet amount"
            type="number"
            min={0}
            step={0.5}
            value={betAmount}
            onChange={(e) => onBetAmountChange(Number(e.target.value))}
            placeholder="Amount"
            className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100"
            onClick={() => onQuickPick()}
          >
            Quick Pick
          </button>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => onQuickPick(5)} className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-100">5</button>
            <button type="button" onClick={() => onQuickPick(7)} className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-100">7</button>
            <button type="button" onClick={() => onQuickPick(10)} className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-100">10</button>
          </div>
          <button
            type="button"
            className="rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100"
            onClick={onClear}
          >
            Clear
          </button>
          <button
            type="button"
            className="ml-auto rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-50 disabled:bg-emerald-900 disabled:text-emerald-300"
            disabled={isPlaceBetDisabled}
            onClick={onPlaceBet}
          >
            Place Bet
          </button>
          {lastBet && onRebet && (
            <button type="button" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white" onClick={onRebet}>Rebet</button>
          )}
        </div>
      </div>
    </aside>
  )
}

