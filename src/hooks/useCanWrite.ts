import { useAuthStore } from '../store/authStore'
import { hasAnyRole } from '../config/roles'
import type { Role } from '../types'

export function useCanWrite(writeRoles: Role[]) {
  const user = useAuthStore((s) => s.user)
  return hasAnyRole(user, writeRoles)
}
