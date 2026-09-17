import { Navigate, Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import PersonasPage from './pages/PersonasPage'
import AportesPage from './pages/AportesPage'
import PrestamosPage from './pages/PrestamosPage'
import RifasPage from './pages/RifasPage'
import LiquidacionPage from './pages/LiquidacionPage'

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/personas" replace />} />
          <Route path="/personas" element={<PersonasPage />} />
          <Route path="/aportes" element={<AportesPage />} />
          <Route path="/prestamos" element={<PrestamosPage />} />
          <Route path="/rifas" element={<RifasPage />} />
          <Route path="/liquidacion" element={<LiquidacionPage />} />
        </Routes>
      </main>
    </div>
  )
}
