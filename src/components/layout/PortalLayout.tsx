import { useMutation } from '@tanstack/react-query'
import { GraduationCap, LogOut } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout as apiLogout } from '../../api/auth'
import { AppearancePopover } from '../AppearancePopover'
import { UnitTabs } from './UnitSwitcher'
import { Button } from '../ui/AppButton'
import { BottomNav } from './BottomNav'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '../ui/sidebar'
import { NAV_SECTIONS } from '../../config/nav'
import { ROLE_LABEL, userRoles as rolesOf } from '../../config/roles'
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
  const userRoles = rolesOf(user)

  const sections = NAV_SECTIONS.filter((section) => !section.hideFor?.some((r) => userRoles.includes(r)))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.some((r) => userRoles.includes(r))),
    }))
    .filter((section) => section.items.length > 0)

  // Top 4 items across this role's own sections, in the order config/nav.ts
  // already ranks them (Dashboard etc. first) -- shown in the bottom tab
  // bar so they're a thumb's reach away instead of top-left.
  const primaryItems = sections.flatMap((s) => s.items).slice(0, 4)

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-soft">
              <GraduationCap className="h-4.5 w-4.5" strokeWidth={2.25} />
            </span>
            <p className="text-sm font-semibold leading-tight text-sidebar-foreground">
              Sistem Informasi Madrasah
            </p>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {sections.map((section) => (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                              isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                            }
                          >
                            <Icon />
                            <span>{item.label}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center justify-between gap-2 px-2 py-1">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-5 text-sidebar-foreground">{user.nama}</p>
              <p className="truncate text-sm leading-5 text-muted-foreground">{ROLE_LABEL[user.role]}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              aria-label="Keluar"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 shadow-soft backdrop-blur sm:px-5">
          {/* Hidden on mobile: BottomNav's "Lainnya" button opens the same
           * sidebar sheet, closer to the thumb than top-left. */}
          <SidebarTrigger className="hidden md:flex" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-5 text-foreground">{user.nama}</p>
            <p className="truncate text-sm leading-5 text-muted-foreground">{ROLE_LABEL[user.role]}</p>
          </div>
          <AppearancePopover />
        </header>
        <UnitTabs />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 pb-20 sm:p-5 md:pb-5">
          <Outlet />
        </main>
        <BottomNav items={primaryItems} />
      </SidebarInset>
    </SidebarProvider>
  )
}
