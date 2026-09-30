import { apiClient } from '../lib/apiClient'
import type { Jadwal, Mapel, MateriTarget, Penugasan, ProgresEntry, Santri } from '../types'

export async function getPenugasanSaya(): Promise<Penugasan[]> {
  const { data } = await apiClient.get<Penugasan[]>('/guru-mapel/penugasan-saya')
  return data
}

/** Mapel yang ditugaskan ke guru ini saja (lihat GuruMapelRombel di
 * backend) -- beda dari kurikulum.listMapel yang menampilkan semua mapel
 * madrasah dan hanya boleh diakses staf kurikulum. */
export async function getMapelSaya(): Promise<Mapel[]> {
  const { data } = await apiClient.get<Mapel[]>('/guru-mapel/mapel-saya')
  return data
}

export async function patchMateriSaya(id: string, payload: { judul?: string; urutan?: number; aktif?: boolean }) {
  const { data } = await apiClient.patch<MateriTarget>(`/guru-mapel/materi/${id}`, payload)
  return data
}


/** Jadwal rombel yang ditugaskan ke guru (backend memfilter dari penugasan). */
export async function getJadwalSaya(rombelId?: string): Promise<Jadwal[]> {
  const { data } = await apiClient.get<Jadwal[]>('/guru-mapel/jadwal', {
    params: { rombel_id: rombelId },
  })
  return data
}

export async function getSantriRombel(rombelId: string): Promise<Santri[]> {
  const { data } = await apiClient.get<Santri[]>('/guru-mapel/santri', { params: { rombel_id: rombelId } })
  return data
}

export async function submitAbsensiMapel(payload: {
  tanggal: string
  rombel_id: string
  mapel_id: string
  items: { santri_id: string; status: 'hadir' | 'sakit' | 'izin' | 'alpa' }[]
}) {
  const { data } = await apiClient.post<{ inserted: number }>('/guru-mapel/absensi', payload)
  return data
}

export async function getRekapAbsensiMapel(rombelId: string, mapelId: string) {
  const { data } = await apiClient.get('/guru-mapel/rekap-absensi', {
    params: { rombel_id: rombelId, mapel_id: mapelId },
  })
  return data
}

export async function submitProgresGuruMapel(payload: {
  tanggal: string
  santri_id: string
  tipe: string
  capaian: string
  catatan_guru?: string
  mapel_id?: string
  materi_id?: string
}) {
  const { data } = await apiClient.post('/guru-mapel/progres', payload)
  return data
}

export async function getRaporSantri(santriId: string): Promise<{ santri_id: string; santri_nama: string; progres: ProgresEntry[] }> {
  const { data } = await apiClient.get(`/guru-mapel/rapor/${santriId}`)
  return data
}
