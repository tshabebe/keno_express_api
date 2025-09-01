import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LobbiesPanel from './features/lobbies/LobbiesPanel'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { user } = useAuth()
  const Main = (
    <Layout>
      <div className="mx-auto max-w-3xl">
            <LobbiesPanel />
      </div>
    </Layout>
  )

  return (
    <Routes>
      <Route path="/" element={user ? Main : <Navigate to="/login" replace />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
    </Routes>
  )
}
