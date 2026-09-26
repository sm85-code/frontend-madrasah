import { apiClient } from '../lib/apiClient'
import type { Akun, BukuKasEntry, Honor, JurnalEntry, LabaRugi, LaporanKeuangan } from '../types'

export async function listBukuKas(bulan?: string): Promise<BukuKasEntry[]> {
  const { data } = await apiClient.get<BukuKasEntry[]>('/keuangan/buku-kas', { params: { bulan } })
  return data
}

export async function createBukuKasEntry(payload: {
  tanggal: string
  tipe: 'masuk' | 'keluar'
  kategori: string
  jumlah: number
  keterangan?: string
}) {
  const { data } = await apiClient.post<BukuKasEntry>('/keuangan/buku-kas', payload)
  return data
}

export async function getLaporanKeuangan(bulan?: string): Promise<LaporanKeuangan> {
  const { data } = await apiClient.get<LaporanKeuangan>('/keuangan/laporan', { params: { bulan } })
  return data
}

export async function listAkun(): Promise<Akun[]> {
  const { data } = await apiClient.get<Akun[]>('/keuangan/akun')
  return data
}

export async function listJurnal(bulan?: string): Promise<JurnalEntry[]> {
  const { data } = await apiClient.get<JurnalEntry[]>('/keuangan/jurnal', { params: { bulan } })
  return data
}

export async function getLabaRugi(bulan?: string): Promise<LabaRugi> {
  const { data } = await apiClient.get<LabaRugi>('/keuangan/laba-rugi', { params: { bulan } })
  return data
}

export async function listHonor(bulan?: string): Promise<Honor[]> {
  const { data } = await apiClient.get<Honor[]>('/keuangan/honor', { params: { bulan } })
  return data
}

export async function generateHonor(bulan?: string): Promise<Honor[]> {
  const { data } = await apiClient.post<Honor[]>('/keuangan/honor/generate', null, { params: { bulan } })
  return data
}

export async function payHonor(id: string): Promise<Honor> {
  const { data } = await apiClient.post<Honor>(`/keuangan/honor/pay/${id}`)
  return data
}
