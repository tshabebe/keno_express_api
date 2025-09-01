import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Layout from './components/Layout'
import { useEffect, useState } from 'react'
import Card from './components/Card'
import { getApiBaseUrl } from './lib/env'

function Login({ onOk }: { onOk: () => void }) {
  const API = getApiBaseUrl()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = async () => {
    setError('')
    const res = await fetch(`${API}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ phoneNumber: phone, password }),
    })
    if (res.ok) onOk(); else setError('Login failed')
  }
  return (
    <div className="mx-auto max-w-sm space-y-3">
      <div className="text-lg font-semibold">Admin Login</div>
      <input className="w-full rounded border px-2 py-1" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <input className="w-full rounded border px-2 py-1" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <div className="text-sm text-red-500">{error}</div>}
      <button className="rounded bg-indigo-600 px-3 py-2 text-white" onClick={submit}>Login</button>
    </div>
  )
}

function Dashboard() {
  const API = getApiBaseUrl()
  const [stats, setStats] = useState<{ users: number; income: number }>({ users: 0, income: 0 })
  useEffect(() => {
    (async () => {
      try {
        const [u, i] = await Promise.all([
          fetch(`${API}/admin/stats/users`, { credentials: 'include' }).then(r => r.json()).catch(() => ({ totalUsers: 0 })),
          fetch(`${API}/admin/stats/income`, { credentials: 'include' }).then(r => r.json()).catch(() => ({ totalIncome: 0 })),
        ])
        setStats({ users: Number(u?.totalUsers || 0), income: Number(i?.totalIncome || 0) })
      } catch {}
    })()
  }, [])

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs text-slate-300/80">Total Users</div>
          <div className="text-2xl font-bold text-slate-100">{stats.users.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-300/80">Total Income</div>
          <div className="text-2xl font-bold text-emerald-200">ETB {stats.income.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-300/80">Admin Actions</div>
          <div className="mt-2 flex gap-2">
            <Link to="/config/keno" className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-slate-100 backdrop-blur-xl hover:bg-white/15">Keno Config</Link>
            <Link to="/users" className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-slate-100 backdrop-blur-xl hover:bg-white/15">Users</Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <div className="text-base font-semibold text-slate-100">Keno</div>
          <div className="text-sm text-slate-300/90">Configure payouts and rules.</div>
          <div className="mt-3">
            <Link to="/config/keno" className="rounded-xl border border-white/10 bg-gradient-to-b from-indigo-600 to-indigo-700 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-900/30 hover:from-indigo-500 hover:to-indigo-600">Open Config</Link>
          </div>
        </Card>
        {/* Future game cards can be added here */}
      </div>
    </div>
  )
}

function KenoConfigPage() {
  const API = getApiBaseUrl()
  const [rows, setRows] = useState<Array<{ picks: string; payout: string }>>([
    { picks: '5', payout: '2' },
    { picks: '6', payout: '4' },
  ])
  const [msg, setMsg] = useState('')
  const addRow = () => setRows(prev => [...prev, { picks: '', payout: '' }])
  const save = async () => {
    const payouts: Record<string, number> = {}
    for (const r of rows) {
      const k = r.picks.trim()
      const v = Number(r.payout)
      if (!k || Number.isNaN(v)) continue
      payouts[k] = v
    }
    setMsg('')
    const res = await fetch(`${API}/admin/configs/keno`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ data: { payouts } }),
    })
    setMsg(res.ok ? 'Saved' : 'Save failed')
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="text-lg font-semibold">Keno Config</div>
      <Card className="p-4">
        <div className="mb-2 text-sm text-slate-300/90">Payouts</div>
        <div className="space-y-2">
          {rows.map((r, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-2">
              <input className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none backdrop-blur-md" placeholder="Picks" value={r.picks} onChange={e => setRows(v => v.map((x, i) => i === idx ? { ...x, picks: e.target.value } : x))} />
              <input className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none backdrop-blur-md" placeholder="Payout" value={r.payout} onChange={e => setRows(v => v.map((x, i) => i === idx ? { ...x, payout: e.target.value } : x))} />
            </div>
          ))}
          <div className="flex gap-2">
            <button className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-slate-100 backdrop-blur-xl hover:bg-white/15" onClick={addRow}>Add Row</button>
            <button className="rounded-xl border border-emerald-300/20 bg-gradient-to-b from-emerald-600 to-emerald-700 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-900/30 hover:from-emerald-500 hover:to-emerald-600" onClick={save}>Save</button>
            {msg && <span className="text-sm text-slate-300">{msg}</span>}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(false)
  const Main = (
    <Layout>
      {authed ? <Dashboard /> : <Login onOk={() => setAuthed(true)} />}
    </Layout>
  )
  return (
    <Routes>
      <Route path="/" element={Main} />
      <Route path="/config/keno" element={<Layout>{authed ? <KenoConfigPage /> : <Navigate to="/" replace />}</Layout>} />
      <Route path="/users" element={<Layout>{authed ? <div className="mx-auto max-w-6xl"><Card className="p-4">Users management (coming soon)</Card></div> : <Navigate to="/" replace />}</Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
