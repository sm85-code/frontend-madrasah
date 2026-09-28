import { Menu } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { useSidebar } from '../ui/sidebar'
import type { NavItem } from '../../config/nav'

/** Mobile bottom tab bar (kept at bottom — not siabumdes top hamburger).
 * Fixed slots: Dashboard → Mapel → Guru → Santri → Lainnya (opens sidebar sheet).
 * Tabs the user cannot access are hidden; Lainnya is always shown. */
export function BottomNav({ items }: { items: NavItem[] }) {
  const { setOpenMobile } = useSidebar()

  return (
    <nav
      className="bottom-nav-shell fixed inset-x-0 bottom-0 z-20 flex items-stretch md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground transition-colors',
                isActive && 'text-primary',
              )
            }
          >
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-xl',
                'bg-[var(--surface-alt)]',
              )}
            >
              <Icon className="size-4.5" strokeWidth={2} />
            </span>
            <span className="truncate px-1">{item.shortLabel ?? item.label}</span>
          </NavLink>
        )
      })}
      <button
        type="button"
        onClick={() => setOpenMobile(true)}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground"
        aria-label="Buka menu lainnya"
      >
        <span className="flex size-8 items-center justify-center rounded-xl bg-[var(--surface-alt)]">
          <Menu className="size-4.5" strokeWidth={2} />
        </span>
        <span>Lainnya</span>
      </button>
    </nav>
  )
}
