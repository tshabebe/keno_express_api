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
    <section className="rounded-lg bg-slate-900 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">History</h2>
        <span className="text-xs text-slate-400">{entries.length}</span>
      </div>

      <div className="mt-3 grid gap-2">
        {entries.length === 0 ? (
          <span className="text-xs text-slate-500">No history yet</span>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="rounded-md bg-slate-800 p-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">{new Date(e.date).toLocaleString()}</span>
                <span className={e.payout > 0 ? 'text-emerald-400' : 'text-slate-400'}>
                  {e.payout > 0 ? `+$${e.payout.toFixed(2)}` : '$0.00'}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {e.picks.map((n) => (
                  <span key={n} className="rounded bg-slate-700 px-1.5 py-0.5 font-semibold text-slate-200">
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

