import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Header() {
	const { user, balance } = useAuth()
	const navigate = useNavigate()
	const greeting = useMemo(() => {
		const hour = new Date().getHours()
		if (hour < 12) return 'Good morning'
		if (hour < 18) return 'Good afternoon'
		return 'Good evening'
	}, [])

	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-3">
				<div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-900/40 px-4 py-2 shadow-xl backdrop-blur-xl">
					<div className="text-xs text-slate-300/80">{greeting}</div>
					<div className="text-sm font-semibold text-slate-100">{user?.displayName || 'Player'}</div>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-emerald-500/20 to-emerald-400/10 px-4 py-2 text-sm shadow-xl backdrop-blur-xl">
					<div className="text-xs text-emerald-300/90">Balance</div>
					<div className="text-base font-bold text-emerald-200">${balance.toFixed(2)}</div>
				</div>
				<button
					type="button"
					className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 shadow-md backdrop-blur-xl transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
					onClick={() => navigate('/payments')}
				>
					Add Funds
				</button>
			</div>
		</div>
	)
}

