import { apiClient } from '../lib/apiClient'
import type { Kegiatan, Pengaturan, Pengumuman } from '../types'

// Ketiga GET di bawah publik di backend (tanpa auth) -- dipanggil dari
// halaman Landing/Login sebelum siapa pun login.
export async function getPengaturan(): Promise<Pengaturan> {
  const { data } = await apiClient.get<Pengaturan>('/pengaturan')
  return data
}

export async function getPengumuman(): Promise<Pengumuman[]> {
  const { data } = await apiClient.get<Pengumuman[]>('/pengumuman')
  return data
}

export async function getKegiatan(): Promise<Kegiatan[]> {
  const { data } = await apiClient.get<Kegiatan[]>('/kegiatan')
  return data
}

export interface PendaftaranPayload {
  nama_calon: string
  tempat_lahir?: string
  tanggal_lahir?: string
  nama_orang_tua: string
  no_hp: string
  alamat?: string
  asal_sekolah?: string
  catatan?: string
}

// Form PSB publik -- juga tanpa auth, calon wali santri belum punya akun.
export async function submitPendaftaran(payload: PendaftaranPayload): Promise<{ id: string; status: string }> {
  const { data } = await apiClient.post('/pendaftaran', payload)
  return data
}
