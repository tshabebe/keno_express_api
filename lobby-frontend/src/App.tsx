import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LobbiesPanel from './features/lobbies/LobbiesPanel'

export default function App() {
  const Main = (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <LobbiesPanel />
      </div>
    </Layout>
  )

  return (
    <Routes>
      <Route path="/" element={Main} />
    </Routes>
  )
}
