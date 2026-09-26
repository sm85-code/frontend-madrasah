import { apiClient } from '../lib/apiClient'
import type { Semester, TahunAjaran } from '../types'

export async function listTahunAjaran(): Promise<TahunAjaran[]> {
  const { data } = await apiClient.get<TahunAjaran[]>('/admin/tahun-ajaran')
  return data
}

export async function createTahunAjaran(payload: { kode: string; tanggal_mulai: string; tanggal_selesai: string }) {
  const { data } = await apiClient.post<TahunAjaran>('/admin/tahun-ajaran', payload)
  return data
}

export async function listSemester(): Promise<Semester[]> {
  const { data } = await apiClient.get<Semester[]>('/admin/semester')
  return data
}

export async function createSemester(payload: {
  tahun_ajaran_id: string
  nama: 'Ganjil' | 'Genap'
  tanggal_mulai: string
  tanggal_selesai: string
}) {
  const { data } = await apiClient.post<Semester>('/admin/semester', payload)
  return data
}

export async function aktifkanSemester(id: string) {
  const { data } = await apiClient.post<Semester>(`/admin/semester/${id}/aktifkan`)
  return data
}

export async function tutupSemester(id: string) {
  const { data } = await apiClient.post<Semester>(`/admin/semester/${id}/tutup`)
  return data
}

export async function getSemesterAktif(): Promise<Semester | null> {
  const { data } = await apiClient.get<Semester | null>('/semester/aktif')
  return data
}
