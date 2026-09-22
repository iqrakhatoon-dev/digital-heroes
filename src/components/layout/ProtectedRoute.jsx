import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function ProtectedRoute({ children, requireAdmin = false, requireSubscription = false }) {
  const { user, profile, isAdmin, isSubscribed, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-mint border-t-transparent rounded-full animate-spin" />
          <p className="text-brand-muted text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  if (requireSubscription && !isSubscribed) {
    return <Navigate to="/subscribe" state={{ message: 'Subscribe to access this feature.' }} replace />
  }

  return children
}
