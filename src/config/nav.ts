import {
  Banknote,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Heart,
  LayoutDashboard,
  Layers,
  LineChart,
  Megaphone,
  MessageCircle,
  Receipt,
  School,
  ScrollText,
  Landmark,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserCircle,
  UserCog,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '../types'
import {
  ALL_ROLES,
  APP_ADMIN_ROLES,
  UNIT_ACCOUNT_READ_ROLES,
  KEUANGAN_READ_ROLES,
  KURIKULUM_READ_ROLES,
  INFO_AKADEMIK_READ_ROLES,
  DASHBOARD_ROLES,
  SANTRI_READ_ROLES,
  ROMBEL_READ_ROLES,
  KENAIKAN_READ_ROLES,
  PROFIL_LEMBAGA_READ_ROLES,
  PSB_READ_ROLES,
  YAYASAN_ROLES,
  ANAK_SAYA_ROLES,
  ABSENSI_REKAP_ROLES,
  ABSENSI_MAPEL_READ_ROLES,
  WALI_KELAS_READ_ROLES,
  PESAN_ROLES,
  PENUGASAN_SAYA_ROLES,
  RAPOR_READ_ROLES,
} from './roles'

export interface NavItem {
  label: string
  shortLabel?: string
  path: string
  roles: Role[]
  icon: LucideIcon
}

export interface NavSection {
  title: string
  items: NavItem[]
  hideFor?: Role[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Ringkasan',
    items: [{ label: 'Dashboard', shortLabel: 'Beranda', path: '/portal/dashboard', roles: DASHBOARD_ROLES, icon: LayoutDashboard }],
  },
  {
    title: 'Yayasan',
    items: [
      { label: 'Unit & Rekap', shortLabel: 'Unit', path: '/portal/yayasan', roles: YAYASAN_ROLES, icon: Building2 },
      { label: 'Profil Yayasan', shortLabel: 'Yayasan', path: '/portal/yayasan/profil', roles: YAYASAN_ROLES, icon: Landmark },
    ],
  },
  {
    title: 'Lembaga',
    items: [
      { label: 'Profil Lembaga', shortLabel: 'Lembaga', path: '/portal/profil-lembaga', roles: PROFIL_LEMBAGA_READ_ROLES, icon: School },
      { label: 'Pengumuman', shortLabel: 'Info', path: '/portal/pengumuman', roles: INFO_AKADEMIK_READ_ROLES, icon: Megaphone },
      { label: 'Kegiatan & Program', shortLabel: 'Kegiatan', path: '/portal/kegiatan', roles: INFO_AKADEMIK_READ_ROLES, icon: Sparkles },
      { label: 'Pendaftaran PSB', shortLabel: 'PSB', path: '/portal/pendaftaran', roles: PSB_READ_ROLES, icon: UserPlus },
    ],
  },
  {
    title: 'Akademik',
    items: [
      { label: 'Santri', path: '/portal/santri', roles: SANTRI_READ_ROLES, icon: Users },
      { label: 'Rombel & Tingkat', shortLabel: 'Rombel', path: '/portal/rombel', roles: ROMBEL_READ_ROLES, icon: Layers },
      { label: 'Kenaikan Kelas', shortLabel: 'Naik', path: '/portal/kenaikan-kelas', roles: KENAIKAN_READ_ROLES, icon: TrendingUp },
      { label: 'Tahun Ajaran', shortLabel: 'Tahun', path: '/portal/tahun-ajaran', roles: INFO_AKADEMIK_READ_ROLES, icon: CalendarRange },
      { label: 'Mapel & Materi', shortLabel: 'Mapel', path: '/portal/kurikulum/mapel', roles: KURIKULUM_READ_ROLES, icon: BookOpen },
      { label: 'Jadwal', path: '/portal/kurikulum/jadwal', roles: KURIKULUM_READ_ROLES, icon: CalendarDays },
      { label: 'Penugasan Guru', shortLabel: 'Tugas', path: '/portal/kurikulum/penugasan', roles: KURIKULUM_READ_ROLES, icon: ClipboardList },
    ],
  },
  {
    title: 'Keuangan',
    items: [
      { label: 'Buku Kas', shortLabel: 'Kas', path: '/portal/keuangan/buku-kas', roles: KEUANGAN_READ_ROLES, icon: Banknote },
      { label: 'Honor Mengajar', shortLabel: 'Honor', path: '/portal/keuangan/honor', roles: KEUANGAN_READ_ROLES, icon: Wallet },
      { label: 'SPP Syahriyah', shortLabel: 'SPP', path: '/portal/bendahara/spp', roles: KEUANGAN_READ_ROLES, icon: Receipt },
    ],
  },
  {
    title: 'Wali Kelas',
    hideFor: ['yayasan_admin'],
    items: [
      { label: 'Absensi', shortLabel: 'Absen', path: '/portal/wali-kelas/absensi', roles: ABSENSI_REKAP_ROLES, icon: ClipboardCheck },
      { label: 'Progres Santri', shortLabel: 'Progres', path: '/portal/wali-kelas/progres', roles: WALI_KELAS_READ_ROLES, icon: LineChart },
      { label: 'Tagihan Kelas', shortLabel: 'Tagihan', path: '/portal/wali-kelas/tagihan', roles: WALI_KELAS_READ_ROLES, icon: Receipt },
      { label: 'Pesan', path: '/portal/wali-kelas/pesan', roles: PESAN_ROLES, icon: MessageCircle },
    ],
  },
  {
    title: 'Guru Mapel',
    hideFor: ['yayasan_admin'],
    items: [
      { label: 'Penugasan Saya', shortLabel: 'Tugas', path: '/portal/guru-mapel/penugasan', roles: PENUGASAN_SAYA_ROLES, icon: UserCheck },
      { label: 'Absensi Mapel', shortLabel: 'Absen', path: '/portal/guru-mapel/absensi', roles: ABSENSI_MAPEL_READ_ROLES, icon: CalendarCheck },
      { label: 'Rapor Santri', shortLabel: 'Rapor', path: '/portal/guru-mapel/rapor', roles: RAPOR_READ_ROLES, icon: FileText },
    ],
  },
  {
    title: 'Wali Santri',
    items: [{ label: 'Anak Saya', shortLabel: 'Anak', path: '/portal/wali-santri', roles: ANAK_SAYA_ROLES, icon: Heart }],
  },
  {
    title: 'Pengguna',
    items: [
      { label: 'Guru & Wali Santri', shortLabel: 'Staf', path: '/portal/guru', roles: UNIT_ACCOUNT_READ_ROLES, icon: UserCog },
      { label: 'Kelola Akun', path: '/portal/kelola-akun', roles: APP_ADMIN_ROLES, icon: ShieldCheck },
      { label: 'Audit Log', path: '/portal/audit-log', roles: APP_ADMIN_ROLES, icon: ScrollText },
    ],
  },
  {
    title: 'Akun',
    items: [{ label: 'Profil Saya', path: '/portal/profil', roles: ALL_ROLES, icon: UserCircle }],
  },
]

export function firstAccessiblePath(role: Role, extra: Role[] = []): string {
  const roles = new Set([role, ...extra])
  for (const section of NAV_SECTIONS) {
    const item = section.items.find((i) => i.roles.some((r) => roles.has(r)))
    if (item) return item.path
  }
  return '/login'
}

const BOTTOM_NAV_PATHS: Record<Role, string[]> = {
  admin: ['/portal/dashboard', '/portal/santri', '/portal/pengumuman', '/portal/keuangan/buku-kas'],
  yayasan_admin: ['/portal/dashboard', '/portal/yayasan', '/portal/santri', '/portal/keuangan/buku-kas'],
  kepala_sekolah: ['/portal/dashboard', '/portal/santri', '/portal/pengumuman', '/portal/keuangan/buku-kas'],
  lembaga_admin: ['/portal/dashboard', '/portal/santri', '/portal/pengumuman', '/portal/keuangan/buku-kas'],
  kurikulum: ['/portal/dashboard', '/portal/kurikulum/mapel', '/portal/kurikulum/jadwal', '/portal/rombel'],
  bendahara: ['/portal/dashboard', '/portal/keuangan/buku-kas', '/portal/keuangan/honor', '/portal/bendahara/spp'],
  wali_kelas: ['/portal/dashboard', '/portal/wali-kelas/absensi', '/portal/wali-kelas/progres', '/portal/wali-kelas/pesan'],
  guru: ['/portal/dashboard', '/portal/guru-mapel/absensi', '/portal/guru-mapel/rapor', '/portal/guru-mapel/penugasan'],
  wali_santri: ['/portal/wali-santri', '/portal/profil'],
}

export function allNavItems(): NavItem[] {
  return NAV_SECTIONS.flatMap((section) => section.items)
}

export function titleForPath(pathname: string): string {
  const items = allNavItems()
    .filter((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))
    .sort((a, b) => b.path.length - a.path.length)
  if (items[0]) return items[0].label
  if (pathname.startsWith('/portal/profil')) return 'Profil Saya'
  return 'Portal'
}

export function bottomNavItems(role: Role, extra: Role[] = []): NavItem[] {
  const allowed = new Set([role, ...extra])
  const byPath = new Map(allNavItems().map((item) => [item.path, item]))
  const profil: NavItem = {
    label: 'Profil Saya',
    shortLabel: 'Profil',
    path: '/portal/profil',
    roles: ALL_ROLES,
    icon: UserCircle,
  }
  byPath.set(profil.path, profil)
  return (BOTTOM_NAV_PATHS[role] ?? BOTTOM_NAV_PATHS.admin)
    .map((path) => byPath.get(path))
    .filter((item): item is NavItem => !!item && item.roles.some((r) => allowed.has(r)))
}
