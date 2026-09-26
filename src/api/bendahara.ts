import { apiClient } from '../lib/apiClient'
import type { Tagihan } from '../types'

export async function generateSpp(): Promise<Tagihan[]> {
  const { data } = await apiClient.post<Tagihan[]>('/bendahara/spp/generate')
  return data
}

export async function listSppMenunggu(): Promise<Tagihan[]> {
  const { data } = await apiClient.get<Tagihan[]>('/bendahara/spp/menunggu')
  return data
}

export async function paySpp(id: string): Promise<Tagihan> {
  const { data } = await apiClient.post<Tagihan>(`/bendahara/spp/pay/${id}`)
  return data
}
