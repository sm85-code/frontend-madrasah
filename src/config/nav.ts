import type { Role } from '../types'
import {
  ADMIN_ROLES,
  BENDAHARA_ROLES,
  GURU_MAPEL_ROLES,
  KURIKULUM_ROLES,
  WALI_KELAS_ROLES,
  WALI_SANTRI_ROLES,
  YAYASAN_ROLES,
} from './roles'

export interface NavItem {
  label: string
  path: string
  roles: Role[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Admin',
    items: [
      { label: 'Dashboard', path: '/portal/dashboard', roles: ADMIN_ROLES },
      { label: 'Santri', path: '/portal/santri', roles: ADMIN_ROLES },
      { label: 'Rombel & Tingkat', path: '/portal/rombel', roles: ADMIN_ROLES },
      { label: 'Guru & Wali Santri', path: '/portal/guru', roles: ADMIN_ROLES },
      { label: 'Kenaikan Kelas', path: '/portal/kenaikan-kelas', roles: ADMIN_ROLES },
      { label: 'Tahun Ajaran', path: '/portal/tahun-ajaran', roles: ADMIN_ROLES },
      { label: 'Pengumuman', path: '/portal/pengumuman', roles: ADMIN_ROLES },
      { label: 'Audit Log', path: '/portal/audit-log', roles: ADMIN_ROLES },
    ],
  },
  {
    title: 'Keuangan',
    items: [
      { label: 'Buku Kas', path: '/portal/keuangan/buku-kas', roles: ADMIN_ROLES },
      { label: 'Laba Rugi', path: '/portal/keuangan/laba-rugi', roles: ADMIN_ROLES },
      { label: 'Honor Mengajar', path: '/portal/keuangan/honor', roles: ADMIN_ROLES },
    ],
  },
  {
    title: 'Yayasan',
    items: [{ label: 'Unit & Rekap', path: '/portal/yayasan', roles: YAYASAN_ROLES }],
  },
  {
    title: 'Kurikulum',
    items: [
      { label: 'Mapel & Materi', path: '/portal/kurikulum/mapel', roles: KURIKULUM_ROLES },
      { label: 'Jadwal', path: '/portal/kurikulum/jadwal', roles: KURIKULUM_ROLES },
      { label: 'Penugasan Guru', path: '/portal/kurikulum/penugasan', roles: KURIKULUM_ROLES },
    ],
  },
  {
    title: 'Bendahara',
    items: [{ label: 'SPP Syahriyah', path: '/portal/bendahara/spp', roles: BENDAHARA_ROLES }],
  },
  {
    title: 'Wali Kelas',
    items: [
      { label: 'Absensi', path: '/portal/wali-kelas/absensi', roles: WALI_KELAS_ROLES },
      { label: 'Progres Santri', path: '/portal/wali-kelas/progres', roles: WALI_KELAS_ROLES },
      { label: 'Tagihan Kelas', path: '/portal/wali-kelas/tagihan', roles: WALI_KELAS_ROLES },
      { label: 'Pesan', path: '/portal/wali-kelas/pesan', roles: WALI_KELAS_ROLES },
    ],
  },
  {
    title: 'Guru Mapel',
    items: [
      { label: 'Penugasan Saya', path: '/portal/guru-mapel/penugasan', roles: GURU_MAPEL_ROLES },
      { label: 'Absensi Mapel', path: '/portal/guru-mapel/absensi', roles: GURU_MAPEL_ROLES },
      { label: 'Rapor Santri', path: '/portal/guru-mapel/rapor', roles: GURU_MAPEL_ROLES },
    ],
  },
  {
    title: 'Wali Santri',
    items: [{ label: 'Anak Saya', path: '/portal/wali-santri', roles: WALI_SANTRI_ROLES }],
  },
]

export function firstAccessiblePath(role: Role): string {
  for (const section of NAV_SECTIONS) {
    const item = section.items.find((i) => i.roles.includes(role))
    if (item) return item.path
  }
  return '/login'
}
