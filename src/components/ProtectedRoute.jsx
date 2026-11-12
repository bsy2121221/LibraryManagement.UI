import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

// Sends logged-out users to /login (and back here afterwards). With adminOnly, students go to the home page.
export default function ProtectedRoute({ adminOnly = false }) {
  const { isLoggedIn, isAdmin } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
