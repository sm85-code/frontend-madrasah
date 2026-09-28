import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { GraduationCap, LogOut } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { logout as apiLogout } from '../../api/auth'
import { getPengaturan } from '../../api/public'
import { AppearancePopover } from '../AppearancePopover'
import { WallpaperLayer } from '../WallpaperLayer'
import { UnitTabs } from './UnitSwitcher'
import { hideUnitContext } from '../../lib/unitContext'
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
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '../ui/sidebar'
import { NAV_SECTIONS, bottomNavItems, titleForPath } from '../../config/nav'
import { ROLE_LABEL, userRoles as rolesOf } from '../../config/roles'
import { useActiveUnitLabel } from '../../hooks/useActiveUnitLabel'
import { useAuthStore } from '../../store/authStore'
import { LOGO_GLOW_CLASS, resolveLogoUrl } from '../../lib/branding'
import { cn } from '../../lib/utils'

function SidebarNav() {
  const user = useAuthStore((s) => s.user)
  const logoutStore = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const { setOpenMobile, isMobile } = useSidebar()
  const pengaturan = useQuery({ queryKey: ['pengaturan'], queryFn: getPengaturan })

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

  const brandName = pengaturan.data?.nama_sekolah || 'Sistem Informasi Madrasah'
  const logoSrc = resolveLogoUrl(pengaturan.data?.logo_url)
  const [logoBroken, setLogoBroken] = useState(false)

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 py-2">
          {!logoBroken ? (
            <img
              src={logoSrc}
              alt=""
              className={`h-[52px] w-[52px] shrink-0 rounded-full object-contain ${LOGO_GLOW_CLASS}`}
              onError={() => setLogoBroken(true)}
            />
          ) : (
            <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft">
              <GraduationCap className="h-6 w-6" strokeWidth={2.25} />
            </span>
          )}
          <div className="min-w-0">
            <p className="font-heading text-base font-semibold leading-tight text-sidebar-foreground">{brandName}</p>
            <p className="truncate text-xs text-muted-foreground">Portal Madrasah</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                  return (
                    <SidebarMenuItem key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={() => {
                          if (isMobile) setOpenMobile(false)
                        }}
                        className={cn('side-link', active && 'active')}
                      >
                        <span className="nav-ico">
                          <Icon className="size-[18px]" strokeWidth={active ? 2.25 : 2} />
                        </span>
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="space-y-3 px-2 py-1">
          <AppearancePopover triggerClassName="w-full justify-start gap-2" align="start" />
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {user.nama?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-5 text-sidebar-foreground">{user.nama}</p>
              <p className="truncate text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="w-full gap-2" onClick={() => logoutMutation.mutate()}>
            <LogOut className="h-4 w-4" strokeWidth={2} />
            Keluar
          </Button>
        </div>
      </SidebarFooter>
    </>
  )
}

export function PortalLayout() {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const unitLabel = useActiveUnitLabel()
  const tanpaKonteksUnit = hideUnitContext(location.pathname)

  if (!user) return null

  const primaryItems = bottomNavItems(user.role, user.roles)
  const pageTitle = titleForPath(location.pathname)

  return (
    <SidebarProvider className="app-shell relative">
      <WallpaperLayer />
      <Sidebar variant="floating" collapsible="icon">
        <SidebarNav />
      </Sidebar>
      <SidebarInset className="relative z-[1] bg-transparent">
        <header
          className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 sm:px-5"
          style={{
            background: 'color-mix(in oklch, var(--surface) 92%, transparent)',
            borderBottom: '1px solid var(--legacy-border)',
            boxShadow: 'var(--shadow-soft)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <SidebarTrigger className="hidden md:flex" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-5 text-foreground">{pageTitle}</p>
            <p className="truncate text-sm leading-5 text-muted-foreground">
              {tanpaKonteksUnit ? ROLE_LABEL[user.role] : unitLabel ?? ROLE_LABEL[user.role]}
            </p>
          </div>
        </header>
        <UnitTabs />
        <main className="fade-in flex-1 overflow-y-auto p-4 pb-20 sm:p-5 md:pb-5">
          <Outlet />
        </main>
        <BottomNav items={primaryItems} />
      </SidebarInset>
    </SidebarProvider>
  )
}
