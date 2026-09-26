import { useMutation } from '@tanstack/react-query'
import { GraduationCap, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { logout as apiLogout } from '../../api/auth'
import { NAV_SECTIONS, type NavSection } from '../../config/nav'
import { ROLE_LABEL } from '../../config/roles'
import { cn } from '../../lib/cn'
import { useAuthStore } from '../../store/authStore'

function SidebarNav({ sections, onNavigate }: { sections: NavSection[]; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white">
          <GraduationCap className="h-4.5 w-4.5" strokeWidth={2.25} />
        </span>
        <p className="text-sm font-semibold leading-tight text-slate-800">Sistem Informasi Madrasah</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="mb-1.5 px-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                        isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100',
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  )
}

export function PortalLayout() {
  const user = useAuthStore((s) => s.user)
  const logoutStore = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const logoutMutation = useMutation({
    mutationFn: apiLogout,
    onSettled: () => {
      logoutStore()
      navigate('/login', { replace: true })
    },
  })

  // Close the mobile drawer on every route change -- otherwise it stays
  // open over the newly-navigated page.
  const [lastPath, setLastPath] = useState(location.pathname)
  if (location.pathname !== lastPath) {
    setLastPath(location.pathname)
    if (mobileNavOpen) setMobileNavOpen(false)
  }

  if (!user) return null

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(user.role)),
  })).filter((section) => section.items.length > 0)

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <SidebarNav sections={sections} />
      </aside>

      {/* Mobile drawer + backdrop */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <SidebarNav sections={sections} onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="Buka menu"
              className="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-800">{user.nama}</p>
              <p className="text-xs text-slate-500">{ROLE_LABEL[user.role]}</p>
            </div>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            {logoutMutation.isPending ? 'Keluar…' : 'Keluar'}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
