import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (!user?.role || typeof user.role !== 'string') {
    return <Navigate to="/" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={`/${String(user.role).toLowerCase()}`} replace />
  }

  return children
}
