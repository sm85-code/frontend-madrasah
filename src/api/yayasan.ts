import { apiClient } from '../lib/apiClient'
import type { MadrasahUnit, RekapUnit, Yayasan } from '../types'

export async function getYayasan(): Promise<Yayasan> {
  const { data } = await apiClient.get<Yayasan>('/admin/yayasan')
  return data
}

export async function updateYayasan(payload: Partial<{ nama: string; alamat: string }>) {
  const { data } = await apiClient.patch<Yayasan>('/admin/yayasan', payload)
  return data
}

export async function listUnit(): Promise<MadrasahUnit[]> {
  const { data } = await apiClient.get<MadrasahUnit[]>('/admin/unit')
  return data
}

export async function createUnit(payload: { nama: string; alamat?: string; kepala_unit?: string; kepala_user_id?: string }) {
  const { data } = await apiClient.post<MadrasahUnit>('/admin/unit', payload)
  return data
}

export async function patchUnit(
  id: string,
  payload: Partial<{ nama: string; alamat: string; kepala_unit: string; kepala_user_id: string; aktif: boolean }>,
) {
  const { data } = await apiClient.patch<MadrasahUnit>(`/admin/unit/${id}`, payload)
  return data
}

export async function getRekapYayasan(): Promise<RekapUnit[]> {
  const { data } = await apiClient.get<RekapUnit[]>('/admin/yayasan/rekap')
  return data
}
