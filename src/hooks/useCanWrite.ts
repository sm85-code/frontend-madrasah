import { useAuthStore } from '../store/authStore'
import { canWrite } from '../config/roles'
import type { Role } from '../types'

export function useCanWrite(writeRoles: Role[]) {
  const role = useAuthStore((s) => s.user?.role)
  return canWrite(role, writeRoles)
}
