import {
  Banknote,
  BookOpen,
  Building2,
  CalendarDays,
  CalendarRange,
  CheckSquare,
  ClipboardList,
  FileText,
  Heart,
  LayoutDashboard,
  Layers,
  LineChart,
  Megaphone,
  MessageCircle,
  Receipt,
  ScrollText,
  Landmark,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserCircle,
  UserCog,
  UserPlus,
  Users,
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
  path: string
  roles: Role[]
  icon: LucideIcon
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Admin',
    items: [
      { label: 'Dashboard', path: '/portal/dashboard', roles: DASHBOARD_ROLES, icon: LayoutDashboard },
      { label: 'Santri', path: '/portal/santri', roles: SANTRI_READ_ROLES, icon: Users },
      { label: 'Rombel & Tingkat', path: '/portal/rombel', roles: ROMBEL_READ_ROLES, icon: Layers },
      { label: 'Guru & Wali Santri', path: '/portal/guru', roles: UNIT_ACCOUNT_READ_ROLES, icon: UserCog },
      { label: 'Kelola Akun', path: '/portal/kelola-akun', roles: APP_ADMIN_ROLES, icon: ShieldCheck },
      { label: 'Kenaikan Kelas', path: '/portal/kenaikan-kelas', roles: KENAIKAN_READ_ROLES, icon: TrendingUp },
      { label: 'Tahun Ajaran', path: '/portal/tahun-ajaran', roles: INFO_AKADEMIK_READ_ROLES, icon: CalendarRange },
      { label: 'Pengumuman', path: '/portal/pengumuman', roles: INFO_AKADEMIK_READ_ROLES, icon: Megaphone },
      { label: 'Pendaftaran PSB', path: '/portal/pendaftaran', roles: PSB_READ_ROLES, icon: UserPlus },
      { label: 'Profil Lembaga', path: '/portal/profil-lembaga', roles: PROFIL_LEMBAGA_READ_ROLES, icon: Landmark },
      { label: 'Kegiatan & Program', path: '/portal/pengaturan', roles: INFO_AKADEMIK_READ_ROLES, icon: Settings },
      { label: 'Audit Log', path: '/portal/audit-log', roles: APP_ADMIN_ROLES, icon: ScrollText },
    ],
  },
  {
    title: 'Keuangan',
    items: [
      { label: 'Buku Kas', path: '/portal/keuangan/buku-kas', roles: KEUANGAN_READ_ROLES, icon: Banknote },
      { label: 'Honor Mengajar', path: '/portal/keuangan/honor', roles: KEUANGAN_READ_ROLES, icon: Receipt },
    ],
  },
  {
    title: 'Yayasan',
    items: [
      { label: 'Unit & Rekap', path: '/portal/yayasan', roles: YAYASAN_ROLES, icon: Building2 },
      { label: 'Profil Yayasan', path: '/portal/yayasan/profil', roles: YAYASAN_ROLES, icon: Landmark },
    ],
  },
  {
    title: 'Kurikulum',
    items: [
      { label: 'Mapel & Materi', path: '/portal/kurikulum/mapel', roles: KURIKULUM_READ_ROLES, icon: BookOpen },
      { label: 'Jadwal', path: '/portal/kurikulum/jadwal', roles: KURIKULUM_READ_ROLES, icon: CalendarDays },
      { label: 'Penugasan Guru', path: '/portal/kurikulum/penugasan', roles: KURIKULUM_READ_ROLES, icon: ClipboardList },
    ],
  },
  {
    title: 'Bendahara',
    items: [{ label: 'SPP Syahriyah', path: '/portal/bendahara/spp', roles: KEUANGAN_READ_ROLES, icon: Receipt }],
  },
  {
    title: 'Wali Kelas',
    items: [
      { label: 'Absensi', path: '/portal/wali-kelas/absensi', roles: ABSENSI_REKAP_ROLES, icon: CheckSquare },
      { label: 'Progres Santri', path: '/portal/wali-kelas/progres', roles: WALI_KELAS_READ_ROLES, icon: LineChart },
      { label: 'Tagihan Kelas', path: '/portal/wali-kelas/tagihan', roles: WALI_KELAS_READ_ROLES, icon: Receipt },
      { label: 'Pesan', path: '/portal/wali-kelas/pesan', roles: PESAN_ROLES, icon: MessageCircle },
    ],
  },
  {
    title: 'Guru Mapel',
    items: [
      { label: 'Penugasan Saya', path: '/portal/guru-mapel/penugasan', roles: PENUGASAN_SAYA_ROLES, icon: ClipboardList },
      { label: 'Absensi Mapel', path: '/portal/guru-mapel/absensi', roles: ABSENSI_MAPEL_READ_ROLES, icon: CheckSquare },
      { label: 'Rapor Santri', path: '/portal/guru-mapel/rapor', roles: RAPOR_READ_ROLES, icon: FileText },
    ],
  },
  {
    title: 'Wali Santri',
    items: [{ label: 'Anak Saya', path: '/portal/wali-santri', roles: ANAK_SAYA_ROLES, icon: Heart }],
  },
  {
    // Selalu ditaruh paling akhir: firstAccessiblePath() memilih item
    // section PERTAMA yang cocok dengan role user sebagai halaman
    // pendaratan setelah login -- taruh section ini di awal akan membuat
    // semua role mendarat di Profil Saya alih-alih halaman kerja
    // utamanya masing-masing.
    title: 'Akun',
    items: [{ label: 'Profil Saya', path: '/portal/profil', roles: ALL_ROLES, icon: UserCircle }],
  },
]

export function firstAccessiblePath(role: Role): string {
  for (const section of NAV_SECTIONS) {
    const item = section.items.find((i) => i.roles.includes(role))
    if (item) return item.path
  }
  return '/login'
}
