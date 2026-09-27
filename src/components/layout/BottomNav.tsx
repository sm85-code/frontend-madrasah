import { Menu } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { useSidebar } from '../ui/sidebar'
import type { NavItem } from '../../config/nav'

/** Mobile-only bottom tab bar: the sidebar's hamburger trigger sits
 * top-left, which on a big-screen phone is a full thumb-stretch away from
 * whatever the user is actually holding. This puts the most-used pages
 * (the first few items of the role's own nav, already ordered by
 * importance in config/nav.ts) within thumb reach at the bottom, plus a
 * "Lainnya" button that opens the same sidebar sheet as before for
 * everything else -- so nothing about the existing nav data or the
 * sidebar itself needs to change, just how the top few items are reached. */
export function BottomNav({ items }: { items: NavItem[] }) {
  const { setOpenMobile } = useSidebar()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex items-stretch border-t border-border bg-card/95 backdrop-blur md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', boxShadow: '0 -2px 8px -2px oklch(0.16 0.014 240 / 8%)' }}
    >
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground',
                isActive && 'text-primary',
              )
            }
          >
            <Icon className="size-5" strokeWidth={2} />
            <span className="truncate px-1">{item.label}</span>
          </NavLink>
        )
      })}
      <button
        type="button"
        onClick={() => setOpenMobile(true)}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground"
      >
        <Menu className="size-5" strokeWidth={2} />
        <span>Lainnya</span>
      </button>
    </nav>
  )
}
