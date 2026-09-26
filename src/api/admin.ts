import { apiClient } from '../lib/apiClient'
import type {
  AuditLogEntry,
  Pengumuman,
  RekapUmum,
  Rombel,
  Santri,
  Tingkat,
  User,
} from '../types'

export async function getRekap(): Promise<RekapUmum> {
  const { data } = await apiClient.get<RekapUmum>('/admin/rekap')
  return data
}

export async function listTingkat(): Promise<Tingkat[]> {
  const { data } = await apiClient.get<Tingkat[]>('/admin/tingkat')
  return data
}

export async function createTingkat(payload: { nama: string; urutan: number; madrasah_unit_id?: string }) {
  const { data } = await apiClient.post<Tingkat>('/admin/tingkat', payload)
  return data
}

export async function deleteTingkat(id: string) {
  await apiClient.delete(`/admin/tingkat/${id}`)
}

export async function listRombel(): Promise<Rombel[]> {
  const { data } = await apiClient.get<Rombel[]>('/admin/rombel')
  return data
}

export async function createRombel(payload: {
  nama: string
  tingkat_id?: string | null
  wali_kelas_id?: string | null
  madrasah_unit_id?: string
}) {
  const { data } = await apiClient.post<Rombel>('/admin/rombel', payload)
  return data
}

export async function deleteRombel(id: string) {
  await apiClient.delete(`/admin/rombel/${id}`)
}

export async function listGuru(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>('/admin/guru')
  return data
}

export async function createGuru(payload: {
  nama: string
  no_hp: string
  password?: string
  role?: string
  madrasah_unit_id?: string
}) {
  const { data } = await apiClient.post<User>('/admin/guru', payload)
  return data
}

export async function deleteGuru(id: string) {
  await apiClient.delete(`/admin/guru/${id}`)
}

export async function listWaliSantri(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>('/admin/wali-santri')
  return data
}

export async function createWaliSantri(payload: { nama: string; no_hp: string; password?: string }) {
  const { data } = await apiClient.post<User>('/admin/wali-santri', payload)
  return data
}

export async function deleteWaliSantri(id: string) {
  await apiClient.delete(`/admin/wali-santri/${id}`)
}

export async function listSantriAdmin(status = 'semua'): Promise<Santri[]> {
  const { data } = await apiClient.get<Santri[]>('/admin/santri', { params: { status } })
  return data
}

export async function createSantri(payload: {
  nama: string
  rombel_id?: string | null
  orang_tua_id?: string | null
  madrasah_unit_id?: string
}) {
  const { data } = await apiClient.post<Santri>('/admin/santri', payload)
  return data
}

export async function patchSantri(id: string, payload: Partial<{ nama: string; rombel_id: string; orang_tua_id: string }>) {
  const { data } = await apiClient.patch<Santri>(`/admin/santri/${id}`, payload)
  return data
}

export async function deleteSantri(id: string) {
  await apiClient.delete(`/admin/santri/${id}`)
}

export async function placeSantri(santri_id: string, rombel_id: string) {
  const { data } = await apiClient.post('/admin/penempatan', { santri_id, rombel_id })
  return data
}

export async function setSantriStatus(id: string, status: string, tanggal?: string) {
  const { data } = await apiClient.post(`/admin/santri/${id}/status`, { status, tanggal })
  return data
}

export async function getRiwayatKelas(santriId: string) {
  const { data } = await apiClient.get(`/admin/santri/${santriId}/riwayat-kelas`)
  return data
}

export async function kenaikanKelasMassal(items: { santri_id: string; rombel_tujuan_id: string | null }[]) {
  const { data } = await apiClient.post<{ dipindah: string[]; diluluskan: string[] }>('/admin/kenaikan-kelas', {
    items,
  })
  return data
}

export async function createPengumuman(payload: { judul: string; isi: string }) {
  const { data } = await apiClient.post<Pengumuman>('/admin/pengumuman', payload)
  return data
}

export async function getAuditLog(limit = 200): Promise<AuditLogEntry[]> {
  const { data } = await apiClient.get<AuditLogEntry[]>('/admin/audit-log', { params: { limit } })
  return data
}
