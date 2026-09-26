import { apiClient } from '../lib/apiClient'
import type { User } from '../types'

export async function login(no_hp: string, password: string): Promise<User> {
  const { data } = await apiClient.post<{ user: User }>('/auth/login', { no_hp, password })
  return data.user
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}
