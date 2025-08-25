import { useEffect, useState } from 'react'
import { createLobby, joinLobbyApi, listLobbies, setLobbyRound, type Lobby } from '../../lib/lobbies'
import { useAuth } from '../../context/AuthContext'

export default function LobbiesPanel({ currentRoundId }: { currentRoundId?: string }) {
  const { user } = useAuth()
  const [items, setItems] = useState<Lobby[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setItems(await listLobbies())
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed')
      }
    })()
  }, [])

  const create = async () => {
    try {
      setLoading(true)
      const lobby = await createLobby({ name: name || 'Lobby' })
      if (currentRoundId && lobby?.id) await setLobbyRound(lobby.id, currentRoundId)
      setItems(await listLobbies())
      setName('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const join = async (id: string) => {
    try {
      setLoading(true)
      await joinLobbyApi(id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-lg bg-slate-900 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Lobbies</h2>
        {!user && <span className="text-xs text-slate-500">Sign in to create/join</span>}
      </div>
      <div className="mt-3 grid gap-3">
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Lobby name"
            className="flex-1 rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            disabled={!user || loading}
          />
        
          <button onClick={create} disabled={!user || loading} className="rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 disabled:opacity-50">
            Create
          </button>
        </div>
        {error && <div className="text-xs text-red-400">{error}</div>}

        <div className="grid gap-2">
          {items.length === 0 ? (
            <span className="text-xs text-slate-500">No lobbies</span>
          ) : (
            items.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-md bg-slate-800 p-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-100">{l.name}</span>
                  <span className="text-xs text-slate-400">{(l.players?.length || 0)}/{l.max_players || 0}</span>
                </div>
                <button onClick={() => join(l.id)} disabled={!user || loading} className="rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-emerald-50 disabled:bg-emerald-900 disabled:text-emerald-300">
                  Join
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

