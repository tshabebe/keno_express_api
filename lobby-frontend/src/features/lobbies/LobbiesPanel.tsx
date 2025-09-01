// Lobbies removed
import { useEffect, useMemo, useState } from 'react'
import { getApiBaseUrl } from '../../lib/env'
import { useAuth } from '../../context/AuthContext'
import Card from '../../components/Card'

type GameInfo = {
  id: string
  name: string
  description: string
  path: string
}

const ALL_GAMES: GameInfo[] = (() => {
  const kenoBase = (typeof window !== 'undefined' && (window as any).VITE_KENO_URL) || getApiBaseUrl().replace('3000', '5173')
  const kenoUrl = `${kenoBase.replace(/\/$/, '')}/keno`
  return [
    { id: 'keno', name: 'Keno', description: 'Classic Keno game', path: kenoUrl },
  ]
})()

export default function LobbiesPanel() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [games, setGames] = useState<GameInfo[]>(ALL_GAMES)

  useEffect(() => {
    const q = query.trim().toLowerCase()
    if (!q) { setGames(ALL_GAMES); return }
    setGames(ALL_GAMES.filter(g => g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)))
  }, [query])

  const onOpen = (g: GameInfo) => {
    const url = new URL(g.path)
    if (token) url.searchParams.set('token', token)
    window.location.href = url.toString()
  }

  const list = useMemo(() => games, [games])

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-3 text-lg font-semibold">Game Lobby</div>
        <input
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 placeholder:text-slate-300/60 outline-none backdrop-blur-md focus:ring-2 focus:ring-indigo-400/40"
          placeholder="Search games..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.length === 0 && (
          <Card className="p-4 text-sm text-slate-300">No games found</Card>
        )}
        {list.map(g => (
          <Card key={g.id} className="group relative overflow-hidden transition-transform hover:-translate-y-0.5">
            <button className="block w-full p-4 text-left" onClick={() => onOpen(g)}>
              <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-white/10 px-2 py-1 text-xs text-slate-200">{g.id.toUpperCase()}</div>
              <div className="mb-1 text-base font-semibold text-slate-100">{g.name}</div>
              <div className="text-sm text-slate-300/90">{g.description}</div>
              <div className="mt-3 text-sm font-medium text-indigo-300">Play →</div>
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}

