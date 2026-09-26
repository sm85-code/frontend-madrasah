import { useMutation } from '@tanstack/react-query'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout as apiLogout } from '../../api/auth'
import { NAV_SECTIONS } from '../../config/nav'
import { ROLE_LABEL } from '../../config/roles'
import { cn } from '../../lib/cn'
import { useAuthStore } from '../../store/authStore'

export function PortalLayout() {
  const user = useAuthStore((s) => s.user)
  const logoutStore = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const logoutMutation = useMutation({
    mutationFn: apiLogout,
    onSettled: () => {
      logoutStore()
      navigate('/login', { replace: true })
    },
  })

  if (!user) return null

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(user.role)),
  })).filter((section) => section.items.length > 0)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-sm font-semibold text-teal-700">Sistem Informasi Madrasah</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">{user.nama}</p>
            <p className="text-xs text-slate-500">{ROLE_LABEL[user.role]}</p>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            {logoutMutation.isPending ? 'Keluar…' : 'Keluar'}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
