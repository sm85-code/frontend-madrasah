import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { listUnit } from '../../api/yayasan'
import { useAuthStore } from '../../store/authStore'
import { useUnitStore } from '../../store/unitStore'
import { cn } from '../../lib/utils'

const CROSS_UNIT_ROLES = new Set(['admin', 'yayasan_admin'])

export function UnitTabs() {
  const role = useAuthStore((s) => s.user?.role)
  const selected = useUnitStore((s) => s.selectedUnitId)
  const setSelected = useUnitStore((s) => s.setSelectedUnitId)
  const queryClient = useQueryClient()
  const enabled = !!role && CROSS_UNIT_ROLES.has(role)
  const units = useQuery({ queryKey: ['yayasan', 'unit'], queryFn: listUnit, enabled })
  const list = units.data ?? []

  useEffect(() => {
    if (!enabled || list.length === 0) return
    if (!selected || !list.some((u) => u.id === selected)) {
      setSelected(list[0].id)
      void queryClient.invalidateQueries()
    }
  }, [enabled, list, selected, setSelected, queryClient])

  if (!enabled || list.length === 0) return null

  return (
    <div className="border-b border-border bg-card px-4 py-2 sm:px-5">
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Unit</p>
      <div className="flex gap-1 overflow-x-auto pb-0.5">
        {list.map((u) => {
          const active = selected === u.id
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                setSelected(u.id)
                void queryClient.invalidateQueries()
              }}
              className={cn(
                'h-8 shrink-0 rounded-md px-3 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
              )}
            >
              {u.nama}
            </button>
          )
        })}
      </div>
    </div>
  )
}
