import { useQuery } from '@tanstack/react-query'
import { listUnitPublik } from '../api/public'
import { useAuthStore } from '../store/authStore'
import { useUnitStore } from '../store/unitStore'

const TAB_YAYASAN = '__yayasan__'

export function useActiveUnitLabel(): string | null {
  const user = useAuthStore((s) => s.user)
  const selected = useUnitStore((s) => s.selectedUnitId)
  const units = useQuery({ queryKey: ['unit-publik'], queryFn: listUnitPublik })
  const list = units.data ?? []
  if (!user) return null
  if (user.role === 'admin' || user.role === 'yayasan_admin') {
    if (selected === TAB_YAYASAN) return 'Yayasan'
    return list.find((u) => u.id === selected)?.nama ?? null
  }
  const id = user.madrasah_unit_id ?? user.tugas?.[0]?.madrasah_unit_id
  return list.find((u) => u.id === id)?.nama ?? null
}
