import { useAuth } from '../context/AuthContext'

export default function Header({ balance }: { balance: number }) {
  const { user } = useAuth()
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-emerald-900 text-emerald-300 font-bold">
          K
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-emerald-300">Keno</span>
          <span className="text-xs text-slate-400">Play. Pick. Win.</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-200">
          Balance: <span className="font-semibold text-slate-100">${balance.toFixed(2)}</span>
        </div>
        {user && <span className="text-xs text-slate-400">{user.displayName || user.email}</span>}
      </div>
    </div>
  )
}

