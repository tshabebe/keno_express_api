type HistoryEntry = {
  id: string
  drawn: number[]
  picks: number[]
  bet: number
  payout: number
  date: string
}

export default function HistoryPanel({ entries }: { entries: HistoryEntry[] }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/50 shadow-xl backdrop-blur-xl p-3 sm:p-4">
      <div aria-hidden className="glow-emerald -top-14 -right-16 h-40 w-40"></div>
      <div aria-hidden className="glow-indigo -bottom-14 -left-16 h-40 w-40"></div>
      <div className="relative flex items-center justify-between">
        <h2 className="bg-gradient-to-r from-emerald-300 to-indigo-300 bg-clip-text text-transparent text-sm font-semibold">History</h2>
        <span className="text-xs text-slate-300/90">{entries.length}</span>
      </div>

      <div className="mt-3 grid gap-2">
        {entries.length === 0 ? (
          <span className="text-xs text-slate-400/80">No history yet</span>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="rounded-xl border border-white/10 bg-slate-800/60 p-2 text-xs backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-slate-300/90">{new Date(e.date).toLocaleString()}</span>
                <span className={e.payout > 0 ? 'text-emerald-300' : 'text-slate-400'}>
                  {e.payout > 0 ? `+$${e.payout.toFixed(2)}` : '$0.00'}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {e.picks.map((n) => (
                  <span key={n} className="rounded-lg border border-white/10 bg-slate-800/80 px-1.5 py-0.5 font-semibold text-slate-100 shadow-sm transition-transform duration-200 ease-out hover:-translate-y-0.5">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

