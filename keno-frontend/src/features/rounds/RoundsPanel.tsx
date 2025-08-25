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

  return (
    <section className="rounded-lg bg-slate-900 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Rounds</h2>
        <button onClick={createToday} disabled={loading} className="rounded-md bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 disabled:opacity-50">Create Today</button>
      </div>
      {error && <div className="mt-2 text-xs text-red-400">{error}</div>}
      <div className="mt-3 grid gap-2">
        {items.length === 0 ? (
          <span className="text-xs text-slate-500">No rounds</span>
        ) : (
          items.map((r) => (
            <button
              key={r._id}
              onClick={() => { setCurrent(r._id); onSelect(r._id) }}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-xs ${current === r._id ? 'bg-emerald-800 text-emerald-50' : 'bg-slate-800 text-slate-200'}`}
            >
              <span>Round {r._id.slice(-6)}</span>
              <span className="text-slate-400">{(r.starts_at || '').slice(0,10)} → {(r.ends_at || '').slice(0,10)}</span>
            </button>
          ))
        )}
      </div>
    </section>
  )
}

