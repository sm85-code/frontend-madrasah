import { Navigate, Outlet } from 'react-router-dom'
import { hasAnyRole } from '../config/roles'
import { useAuthStore } from '../store/authStore'
import type { Role } from '../types'

export function RoleGuard({ roles }: { roles?: Role[] }) {
  const user = useAuthStore((s) => s.user)

  if (!user) return <Navigate to="/login" replace />
  if (roles && !hasAnyRole(user, roles)) return <Navigate to="/portal" replace />

  return <Outlet />
}

export function RequireAuth() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
