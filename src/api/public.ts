import { apiClient } from '../lib/apiClient'
import type { Pengaturan, Pengumuman } from '../types'

// Kedua endpoint ini publik di backend (tanpa auth) -- dipanggil dari
// halaman Landing/Login sebelum siapa pun login.
export async function getPengaturan(): Promise<Pengaturan> {
  const { data } = await apiClient.get<Pengaturan>('/pengaturan')
  return data
}

export async function getPengumuman(): Promise<Pengumuman[]> {
  const { data } = await apiClient.get<Pengumuman[]>('/pengumuman')
  return data
}
