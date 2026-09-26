import { apiClient } from '../lib/apiClient'
import type { Pesan, ProgresEntry, Tagihan } from '../types'

export async function listPesanAnak(santriId: string): Promise<Pesan[]> {
  const { data } = await apiClient.get<Pesan[]>(`/wali-santri/pesan/${santriId}`)
  return data
}

export async function kirimPesanAnak(santriId: string, isi: string) {
  const { data } = await apiClient.post<Pesan>('/wali-santri/pesan', { santri_id: santriId, isi })
  return data
}

export async function getProgresAnak(santriId: string): Promise<ProgresEntry[]> {
  const { data } = await apiClient.get<ProgresEntry[]>(`/wali-santri/progres/${santriId}`)
  return data
}

export async function getTagihanAnak(santriId: string): Promise<Tagihan[]> {
  const { data } = await apiClient.get<Tagihan[]>(`/wali-santri/tagihan/${santriId}`)
  return data
}
