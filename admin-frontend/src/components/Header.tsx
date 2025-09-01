import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user } = useAuth()
  return (
    <div className="flex items-center justify-between">
      <div />
      <div className="text-xs text-slate-300/90">{user?.displayName || ''}</div>
    </div>
  )
}

