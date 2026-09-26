import { Navigate } from 'react-router-dom'
import { firstAccessiblePath } from '../config/nav'
import { useAuthStore } from '../store/authStore'

export function PortalIndexPage() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={firstAccessiblePath(user.role)} replace />
}
