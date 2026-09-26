import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { Role } from '../types'

/** Wraps a set of routes; redirects to /login if not authenticated, or to
 * the portal home if authenticated but the role isn't in `roles`. Backend
 * re-checks every request regardless -- this only avoids showing a page
 * whose data calls would just 403. */
export function RoleGuard({ roles }: { roles?: Role[] }) {
  const user = useAuthStore((s) => s.user)

  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/portal" replace />

  return <Outlet />
}

export function RequireAuth() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
