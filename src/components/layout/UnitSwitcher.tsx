import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { listUnit } from '../../api/yayasan'
import { sortUnitsByJenjang } from '../../lib/units'
import { useAuthStore } from '../../store/authStore'
import { useUnitStore } from '../../store/unitStore'
import { cn } from '../../lib/utils'
import { hideUnitContext } from '../../lib/unitContext'

const CROSS_UNIT_ROLES = new Set(['admin', 'yayasan_admin'])

const TAB_YAYASAN = '__yayasan__'

export function UnitTabs() {
  const location = useLocation()
  const tanpaKonteksUnit = hideUnitContext(location.pathname)
  const diKelolaAkun = location.pathname.startsWith('/portal/kelola-akun')
  const role = useAuthStore((s) => s.user?.role)
  const selected = useUnitStore((s) => s.selectedUnitId)
  const setSelected = useUnitStore((s) => s.setSelectedUnitId)
  const queryClient = useQueryClient()
  const enabled = !!role && CROSS_UNIT_ROLES.has(role)
  const units = useQuery({ queryKey: ['yayasan', 'unit'], queryFn: listUnit, enabled })
  const list = sortUnitsByJenjang(units.data ?? [])

  useEffect(() => {
    if (!enabled || list.length === 0) return
    if (diKelolaAkun && selected === TAB_YAYASAN) return
    if (!selected || selected === TAB_YAYASAN || !list.some((u) => u.id === selected)) {
      setSelected(list[0].id)
      void queryClient.invalidateQueries()
    }
  }, [enabled, list, selected, setSelected, queryClient, diKelolaAkun])

  if (!enabled || tanpaKonteksUnit || list.length === 0) return null

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
        {diKelolaAkun && (
          <button
            type="button"
            onClick={() => {
              setSelected(TAB_YAYASAN)
              void queryClient.invalidateQueries()
            }}
            className={cn(
              'h-8 shrink-0 rounded-md px-3 text-sm font-medium transition-colors',
              selected === TAB_YAYASAN
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            )}
          >
            Yayasan
          </button>
        )}
      </div>
    </div>
  )
}
