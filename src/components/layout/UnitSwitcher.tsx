import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listUnit } from '../../api/yayasan'
import { useAuthStore } from '../../store/authStore'
import { useUnitStore } from '../../store/unitStore'

const CROSS_UNIT_ROLES = new Set(['admin', 'yayasan_admin'])

export function UnitSwitcher() {
  const role = useAuthStore((s) => s.user?.role)
  const selected = useUnitStore((s) => s.selectedUnitId)
  const setSelected = useUnitStore((s) => s.setSelectedUnitId)
  const queryClient = useQueryClient()
  const enabled = !!role && CROSS_UNIT_ROLES.has(role)
  const units = useQuery({ queryKey: ['yayasan', 'unit'], queryFn: listUnit, enabled })

  if (!enabled) return null

  return (
    <label className="flex min-w-0 max-w-[14rem] flex-col text-[11px] text-muted-foreground">
      Unit
      <select
        className="h-8 truncate rounded-md border border-input bg-background px-2 text-xs text-foreground"
        value={selected ?? ''}
        onChange={(e) => {
          setSelected(e.target.value || null)
          void queryClient.invalidateQueries()
        }}
      >
        <option value="">Semua unit</option>
        {(units.data ?? []).map((u) => (
          <option key={u.id} value={u.id}>
            {u.nama}
          </option>
        ))}
      </select>
    </label>
  )
}
