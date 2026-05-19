import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function RequireAuth({ children, role }) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login', { replace: true }); return }
    if (role && user?.role !== role) navigate('/gm', { replace: true })
  }, [isAuthenticated, user, role])

  if (!isAuthenticated) return null
  if (role && user?.role !== role) return null
  return children
}
