import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuth from '../hooks/useAuth'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="h-7 w-7 rounded-full border-2 border-blue-700 border-t-transparent"
        />
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  if (!user?.role || typeof user.role !== 'string') return <Navigate to="/" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${String(user.role).toLowerCase()}`} replace />

  return children
}
