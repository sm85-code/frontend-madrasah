import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

/**
 * Persisted ONLY for UI convenience (show name/role without a flash of
 * "logged out" on refresh) -- it is not a security boundary. The real
 * session lives in the httpOnly cookie the backend sets; every request
 * still gets re-validated server-side. On a 401 from any request, callers
 * should call logout() to clear this cache and bounce to /login.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'madrasah-auth' },
  ),
)
