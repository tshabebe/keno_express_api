import { useEffect, useState } from 'react'
import { createTodayRound, getCurrentRound, getRounds, type Round } from '../../lib/api'

export default function RoundsPanel({ onSelect }: { onSelect: (roundId: string) => void }) {
  const [items, setItems] = useState<Round[]>([])
  const [current, setCurrent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = async () => {
    try {
      setLoading(true)
      const [list, cur] = await Promise.all([getRounds(), getCurrentRound()])
      setItems(list)
      if (cur) {
        setCurrent(cur._id)
        onSelect(cur._id)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  const createToday = async () => {
    try {
      setLoading(true)
      const r = await createTodayRound()
      await reload()
      onSelect((r as any)?._id || '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const toDateString = (v?: string | Date) => typeof v === 'string' ? v : v ? new Date(v).toISOString() : ''

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/50 shadow-xl backdrop-blur-xl p-3 sm:p-4">
      <div aria-hidden className="glow-emerald -top-14 -right-16 h-40 w-40"></div>
      <div aria-hidden className="glow-indigo -bottom-14 -left-16 h-40 w-40"></div>
      <div className="relative flex items-center justify-between">
        <h2 className="bg-gradient-to-r from-emerald-300 to-indigo-300 bg-clip-text text-transparent text-sm font-semibold">Rounds</h2>
        <button onClick={createToday} disabled={loading} className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-800/70 to-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-100 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:from-slate-700/70 hover:to-slate-800/70 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400/40 disabled:opacity-50">Create Today</button>
      </div>
      {error && <div className="mt-2 text-xs text-red-400">{error}</div>}
      <div className="mt-3 grid gap-2">
        {items.length === 0 ? (
          <span className="text-xs text-slate-400/80">No rounds</span>
        ) : (
          items.map((r) => (
            <button
              key={r._id}
              onClick={() => { setCurrent(r._id); onSelect(r._id) }}
              className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition ${current === r._id ? 'border-emerald-300/20 bg-emerald-800/80 text-emerald-50 shadow-sm' : 'border-white/10 bg-slate-800/80 text-slate-100 hover:-translate-y-0.5'}`}
            >
              <span>Round {r._id.slice(-6)}</span>
              <span className="text-slate-400">{toDateString(r.starts_at).slice(0,10)} → {toDateString(r.ends_at).slice(0,10)}</span>
            </button>
          ))
        )}
      </div>
    </section>
  )
}

