import axios from 'axios'
import { useAuthStore } from '../store/authStore'

/**
 * Backend auth is a cookie (httpOnly, set by POST /auth/login) validated on
 * every request -- see tenants/madrasah/modules/madrasah/infrastructure/auth.py
 * in sm85-arch. withCredentials sends/receives that cookie; the frontend
 * never reads or stores the token itself, only the (non-sensitive) user
 * profile returned by the login response, for display purposes.
 */
const baseURL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/madrasah`

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
})

/** Thrown for any non-2xx response, with the backend's `detail` message
 * (FastAPI's HTTPException shape) surfaced directly for UI display. */
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 0
    const detail =
      error.response?.data?.detail ?? error.message ?? 'Terjadi kesalahan tidak terduga'
    if (status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(new ApiError(status, String(detail)))
  },
)
