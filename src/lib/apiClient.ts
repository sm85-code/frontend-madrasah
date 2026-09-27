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
  // Tanpa ini, browser sesekali melakukan conditional GET (If-None-Match)
  // ke endpoint ini dan dapat 304 Not Modified -- axios menganggap apa pun
  // di luar 200-299 sebagai error (lihat interceptor di bawah), jadi
  // response yang sebenarnya valid ("data belum berubah, pakai versi
  // sebelumnya") malah muncul sebagai error aneh "Request failed with
  // status code 304" di UI (dashboard, dsb). Endpoint-endpoint ini memang
  // harus selalu fresh (dashboard, tagihan, dll), jadi matikan caching di
  // sisi request sama sekali daripada menambal di banyak tempat.
  headers: {
    'Cache-Control': 'no-cache, no-store',
    Pragma: 'no-cache',
  },
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
