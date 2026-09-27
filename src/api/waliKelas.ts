import { apiClient } from '../lib/apiClient'
import type { Mapel, Pesan, Santri, Tagihan } from '../types'

export async function getKurikulumRingkas(): Promise<Mapel[]> {
  const { data } = await apiClient.get<Mapel[]>('/wali-kelas/kurikulum')
  return data
}

export async function submitAbsensi(payload: {
  tanggal: string
  guru_id?: string
  items: { santri_id: string; status: 'hadir' | 'sakit' | 'izin' | 'alpa' }[]
}) {
  const { data } = await apiClient.post<{ inserted: number }>('/wali-kelas/absensi', payload)
  return data
}

export async function submitProgres(payload: {
  tanggal: string
  santri_id: string
  tipe: string
  capaian: string
  catatan_guru?: string
  mapel_id?: string
  materi_id?: string
}) {
  const { data } = await apiClient.post('/wali-kelas/progres', payload)
  return data
}

export async function getTagihanRombel(rombelId: string): Promise<Tagihan[]> {
  const { data } = await apiClient.get<Tagihan[]>('/wali-kelas/tagihan', { params: { rombel_id: rombelId } })
  return data
}

export async function ajukanPembayaran(tagihanId: string): Promise<Tagihan> {
  const { data } = await apiClient.post<Tagihan>(`/wali-kelas/tagihan/ajukan/${tagihanId}`)
  return data
}

export async function patchSantriWaliKelas(santriId: string, payload: { nama?: string; orang_tua_id?: string }) {
  const { data } = await apiClient.patch<Santri>(`/wali-kelas/santri/${santriId}`, payload)
  return data
}

export async function listPesanWaliKelas(santriId: string): Promise<Pesan[]> {
  const { data } = await apiClient.get<Pesan[]>(`/wali-kelas/pesan/${santriId}`)
  return data
}

export async function kirimPesanWaliKelas(santriId: string, isi: string) {
  const { data } = await apiClient.post<Pesan>('/wali-kelas/pesan', { santri_id: santriId, isi })
  return data
}
