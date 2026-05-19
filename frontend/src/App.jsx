import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '@/pages/Home'
import Join from '@/pages/Join'
import Play from '@/pages/Play'
import Login from '@/pages/Login'
import Setup from '@/pages/Setup'
import GMDashboard from '@/pages/GMDashboard'
import GMGame from '@/pages/GMGame'
import AdminDashboard from '@/pages/AdminDashboard'
import QuestionManager from '@/pages/QuestionManager'
import AdManager from '@/pages/AdManager'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/join" element={<Join />} />
      <Route path="/play/:gameCode" element={<Play />} />
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/gm" element={<GMDashboard />} />
      <Route path="/gm/game/:id" element={<GMGame />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/questions" element={<QuestionManager />} />
      <Route path="/ads" element={<AdManager />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
