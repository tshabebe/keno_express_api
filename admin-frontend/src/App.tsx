import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import { useState } from 'react'

function Login({ onOk }: { onOk: () => void }) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = async () => {
    setError('')
    const res = await fetch('http://localhost:3000/admin/login', {
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
  const [json, setJson] = useState('{"payouts": {"5": 2, "6": 4}}')
  const [msg, setMsg] = useState('')
  const load = async () => {
    const res = await fetch('http://localhost:3000/admin/configs/keno', { credentials: 'include' })
    const data = await res.json()
    setJson(JSON.stringify(data?.data ?? {}, null, 2))
  }
  const save = async () => {
    setMsg('')
    try {
      const data = JSON.parse(json)
      const res = await fetch('http://localhost:3000/admin/configs/keno', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data }),
      })
      if (res.ok) setMsg('Saved'); else setMsg('Save failed')
    } catch {
      setMsg('Invalid JSON')
    }
  }
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <div className="text-lg font-semibold">Keno Config</div>
      <div className="flex gap-2">
        <button className="rounded border px-3 py-1" onClick={load}>Load</button>
        <button className="rounded bg-emerald-600 px-3 py-1 text-white" onClick={save}>Save</button>
        {msg && <span className="text-sm text-gray-600">{msg}</span>}
      </div>
      <textarea className="h-80 w-full rounded border p-2 font-mono text-sm" value={json} onChange={(e) => setJson(e.target.value)} />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
