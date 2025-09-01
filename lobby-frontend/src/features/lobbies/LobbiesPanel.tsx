// Lobbies removed
import { useEffect, useMemo, useState } from 'react'
import { getApiBaseUrl } from '../../lib/env'
import { useAuth } from '../../context/AuthContext'

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
    <div className="rounded border p-3">
      <div className="mb-2 font-semibold">Game Lobby</div>
      <input
        className="w-full rounded border px-2 py-1"
        placeholder="Search games..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="mt-3 space-y-2">
        {list.length === 0 && (
          <div className="text-sm text-gray-500">No games found</div>
        )}
        {list.map(g => (
          <button
            key={g.id}
            className="flex w-full items-start justify-between rounded border px-3 py-2 text-left hover:bg-gray-50"
            onClick={() => onOpen(g)}
          >
            <div>
              <div className="font-medium">{g.name}</div>
              <div className="text-xs text-gray-600">{g.description}</div>
            </div>
            <div className="text-xs text-blue-600">Open →</div>
          </button>
        ))}
      </div>
    </div>
  )
}

