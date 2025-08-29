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
  disabled?: boolean
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
  disabled = false,
}: BetControlsProps) {
  return (
    <aside className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/50 p-3 shadow-xl backdrop-blur-xl transition-colors duration-300 sm:p-4">
      <div aria-hidden className="pointer-events-none absolute -top-20 -right-24 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl"></div>
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl"></div>
      <div className="relative flex items-center justify-between">
        <h2 className="bg-gradient-to-r from-emerald-300 to-indigo-300 bg-clip-text text-sm font-semibold text-transparent">Your bet</h2>
        <span className="text-xs text-slate-300/90">{selectedNumbers.length}/{maxPicks} picks</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" aria-live="polite">
        {selectedNumbers.length === 0 ? (
          <span className="text-xs text-slate-400/80">No numbers selected</span>
        ) : (
          selectedNumbers
            .slice()
            .sort((a, b) => a - b)
            .map((num) => (
              <span
                key={num}
                className="rounded-lg border border-emerald-300/20 bg-gradient-to-b from-emerald-700 to-emerald-800/90 px-2 py-1 text-xs font-semibold text-emerald-50 shadow-sm shadow-emerald-900/40 transition-transform duration-200 ease-out hover:-translate-y-0.5"
              >
                {num}
              </span>
            ))
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <div className="grid grid-cols-1 gap-2">
          <label className="text-xs text-slate-300/90">Bet amount</label>
          <select
            value={betAmount}
            onChange={(e) => onBetAmountChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 shadow-inner backdrop-blur-md transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-emerald-400/30 disabled:opacity-60"
          >
            {[10,20,50,100,200].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-800/70 to-slate-900/70 px-3 py-2 text-sm font-semibold text-slate-100 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:from-slate-700/70 hover:to-slate-800/70 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400/40 disabled:opacity-60"
            onClick={() => onQuickPick()}
            disabled={disabled}
          >
            Quick Pick
          </button>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => onQuickPick(5)} disabled={disabled} className="rounded-lg border border-white/10 bg-slate-800/60 px-2 py-1 text-xs text-slate-100 transition-colors hover:bg-slate-700/60 disabled:opacity-60">5</button>
            <button type="button" onClick={() => onQuickPick(7)} disabled={disabled} className="rounded-lg border border-white/10 bg-slate-800/60 px-2 py-1 text-xs text-slate-100 transition-colors hover:bg-slate-700/60 disabled:opacity-60">7</button>
            <button type="button" onClick={() => onQuickPick(10)} disabled={disabled} className="rounded-lg border border-white/10 bg-slate-800/60 px-2 py-1 text-xs text-slate-100 transition-colors hover:bg-slate-700/60 disabled:opacity-60">10</button>
          </div>
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-800/70 to-slate-900/70 px-3 py-2 text-sm font-semibold text-slate-100 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:from-slate-700/70 hover:to-slate-800/70 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400/40 disabled:opacity-60"
            onClick={onClear}
            disabled={disabled}
          >
            Clear
          </button>
          <button
            type="button"
            className="ml-auto rounded-xl border border-emerald-300/20 bg-gradient-to-br from-emerald-600 to-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-900/30 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:from-emerald-500 hover:to-emerald-600 hover:shadow-emerald-500/25 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-emerald-900 disabled:text-emerald-300"
            disabled={isPlaceBetDisabled}
            onClick={onPlaceBet}
          >
            Place Bet
          </button>
          {lastBet && onRebet && (
            <button
              type="button"
              className="rounded-xl border border-indigo-300/20 bg-gradient-to-b from-indigo-600 to-indigo-700 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-900/30 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:from-indigo-500 hover:to-indigo-600 hover:shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              onClick={onRebet}
            >
              Rebet
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

