import { apiClient } from '../lib/apiClient'
import type { Rombel, Santri } from '../types'

// Endpoint yang bisa dipanggil lebih dari satu role (hasilnya sudah
// di-scope oleh backend sesuai role pemanggil -- lihat
// list_rombel_for_caller/list_santri_for_caller di services.py).
export async function listRombelScoped(): Promise<Rombel[]> {
  const { data } = await apiClient.get<Rombel[]>('/admin/rombel')
  return data
}

export async function listSantriScoped(kelasId?: string): Promise<Santri[]> {
  const { data } = await apiClient.get<Santri[]>('/santri', { params: { kelas_id: kelasId } })
  return data
}
