import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, balance } = useAuth()
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-800 text-emerald-50 font-bold shadow-md shadow-emerald-900/30 border border-emerald-300/20">
          K
        </div>
        <div className="flex flex-col">
          <span className="bg-gradient-to-r from-emerald-300 to-indigo-300 bg-clip-text text-transparent text-sm font-semibold">Keno</span>
          <span className="text-xs text-slate-300/90">Play. Pick. Win.</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/50 shadow-xl backdrop-blur-xl px-3 py-2 text-sm">
          Balance: <span className="font-semibold text-slate-100">${balance.toFixed(2)}</span>
        </div>
        {user && <span className="text-xs text-slate-300/90">{user.displayName}</span>}
      </div>
    </div>
  )
}

