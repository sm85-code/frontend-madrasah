import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { useUnitStore } from '../store/unitStore'

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
  // NOTE: previously set Cache-Control/Pragma headers here to stop the
  // browser's conditional GETs (which return 304, see the interceptor
  // below). Reverted -- those aren't in the backend's CORS allow_headers
  // (main.py in sm85-arch), so the browser's preflight got rejected and
  // EVERY request, including login, broke with a network error. The 304
  // fallback message below is enough on its own; fixing the request
  // headers properly means adding them to the backend's CORS config too,
  // not just this file.
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

apiClient.interceptors.request.use((config) => {
  const user = useAuthStore.getState().user
  const selected = useUnitStore.getState().selectedUnitId
  if (user && (user.role === 'admin' || user.role === 'yayasan_admin') && selected) {
    const url = String(config.url ?? '')
    const skip = url.includes('/admin/yayasan') || url.includes('/admin/unit')
    if (!skip) {
      config.params = { ...(config.params ?? {}), unit_id: selected }
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    // Guard against a misconfigured VITE_API_BASE_URL: baseURL can resolve
    // to a relative path that lands on this app's OWN dev/static server
    // instead of the backend, whose SPA catchall then returns index.html
    // with a 200 -- axios hands that HTML string back as "data", which
    // passes every page's `!data` truthiness check and crashes the first
    // component that assumes JSON shape (e.g. `data.list.map`). Fail loud
    // and consistently here instead of piecemeal in every page.
    const contentType = String(response.headers?.['content-type'] ?? '')
    if (!contentType.includes('application/json')) {
      throw new ApiError(
        response.status,
        'Respons server bukan JSON -- kemungkinan VITE_API_BASE_URL salah/tidak diset.',
      )
    }
    return response
  },
  (error) => {
    const status = error.response?.status ?? 0
    if (status === 304) {
      // Lihat komentar di headers Cache-Control di atas -- seharusnya tidak
      // pernah terjadi lagi, tapi kalau ada proxy/CDN di depan yang tetap
      // memaksakan cache, jangan tampilkan "status code 304" mentah ke user.
      return Promise.reject(new ApiError(status, 'Gagal memuat data terbaru, coba muat ulang halaman.'))
    }
    const detail =
      error.response?.data?.detail ?? error.message ?? 'Terjadi kesalahan tidak terduga'
    if (status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(new ApiError(status, String(detail)))
  },
)
