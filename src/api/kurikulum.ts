import { apiClient } from '../lib/apiClient'
import type { Jadwal, Mapel, Penugasan } from '../types'

export async function listMapel(): Promise<Mapel[]> {
  const { data } = await apiClient.get<Mapel[]>('/kurikulum/mapel')
  return data
}

export async function createMapel(payload: { kode: string; nama: string; madrasah_unit_id?: string }) {
  const { data } = await apiClient.post<Mapel>('/kurikulum/mapel', payload)
  return data
}

export async function deleteMapel(id: string) {
  await apiClient.delete(`/kurikulum/mapel/${id}`)
}

export async function createMateri(payload: { mapel_id: string; judul: string; urutan?: number; aktif?: boolean }) {
  const { data } = await apiClient.post('/kurikulum/materi', payload)
  return data
}

export async function deleteMateri(id: string) {
  await apiClient.delete(`/kurikulum/materi/${id}`)
}

export async function listJadwal(rombelId?: string): Promise<Jadwal[]> {
  const { data } = await apiClient.get<Jadwal[]>('/kurikulum/jadwal', { params: { rombel_id: rombelId } })
  return data
}

export async function createJadwal(payload: {
  rombel_id: string
  mapel_id: string
  hari: string
  jam_mulai?: string
  jam_selesai?: string
}) {
  const { data } = await apiClient.post<Jadwal>('/kurikulum/jadwal', payload)
  return data
}

export async function deleteJadwal(id: string) {
  await apiClient.delete(`/kurikulum/jadwal/${id}`)
}

export async function listGuruMapel(guruId?: string): Promise<Penugasan[]> {
  const { data } = await apiClient.get<Penugasan[]>('/kurikulum/guru-mapel', { params: { guru_id: guruId } })
  return data
}

export async function createGuruMapel(payload: {
  guru_id: string
  mapel_id: string
  rombel_id: string
  tarif_per_sesi?: number
}) {
  const { data } = await apiClient.post<Penugasan>('/kurikulum/guru-mapel', payload)
  return data
}

export async function deleteGuruMapel(id: string) {
  await apiClient.delete(`/kurikulum/guru-mapel/${id}`)
}
