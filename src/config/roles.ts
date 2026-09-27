import type { Role } from '../types'

export const APP_ADMIN_ROLES: Role[] = ['admin']
export const YAYASAN_ROLES: Role[] = ['yayasan_admin', 'admin']
export const UNIT_ADMIN_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin']

export const DASHBOARD_ROLES: Role[] = ['admin', 'yayasan_admin', 'kepala_sekolah', 'lembaga_admin', 'guru', 'wali_kelas', 'kurikulum', 'bendahara']
export const SANTRI_READ_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin', 'yayasan_admin']
export const SANTRI_WRITE_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin']
export const ROMBEL_READ_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin', 'kurikulum', 'yayasan_admin']
export const ROMBEL_WRITE_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin', 'kurikulum']
export const KENAIKAN_READ_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin', 'kurikulum', 'wali_kelas', 'yayasan_admin']
export const KENAIKAN_WRITE_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin', 'wali_kelas']
export const KURIKULUM_READ_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin', 'kurikulum', 'yayasan_admin']
export const KURIKULUM_WRITE_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin', 'kurikulum']
export const PENUGASAN_WRITE_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin', 'kurikulum', 'yayasan_admin']
export const KEUANGAN_READ_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin', 'bendahara', 'yayasan_admin']
export const KEUANGAN_WRITE_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin', 'bendahara']
export const PENGUMUMAN_WRITE_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin']
export const INFO_AKADEMIK_READ_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin', 'kurikulum', 'yayasan_admin']
export const INFO_AKADEMIK_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin', 'kurikulum']
export const PROFIL_LEMBAGA_READ_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin', 'yayasan_admin']
export const PROFIL_LEMBAGA_WRITE_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin']
export const PSB_READ_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin', 'yayasan_admin']
export const PSB_WRITE_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin']
export const UNIT_ACCOUNT_READ_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin', 'yayasan_admin']
export const UNIT_ACCOUNT_ROLES: Role[] = ['admin', 'kepala_sekolah', 'lembaga_admin']
export const ANAK_SAYA_ROLES: Role[] = ['wali_santri', 'wali_kelas', 'kepala_sekolah', 'lembaga_admin', 'admin']
export const ABSENSI_REKAP_ROLES: Role[] = ['wali_kelas', 'kepala_sekolah', 'lembaga_admin', 'admin', 'yayasan_admin']
export const ABSENSI_MAPEL_READ_ROLES: Role[] = ['guru', 'kepala_sekolah', 'lembaga_admin', 'admin', 'yayasan_admin']
export const ABSENSI_MAPEL_WRITE_ROLES: Role[] = ['guru', 'kepala_sekolah', 'lembaga_admin', 'admin']
export const WALI_KELAS_READ_ROLES: Role[] = ['wali_kelas', 'kepala_sekolah', 'lembaga_admin', 'admin', 'yayasan_admin']
export const WALI_KELAS_WRITE_ROLES: Role[] = ['wali_kelas', 'kepala_sekolah', 'lembaga_admin', 'admin']
export const PESAN_ROLES: Role[] = ['wali_kelas', 'kepala_sekolah', 'lembaga_admin', 'admin']
export const PENUGASAN_SAYA_ROLES: Role[] = ['guru', 'wali_kelas', 'kepala_sekolah', 'lembaga_admin', 'admin']
export const RAPOR_READ_ROLES: Role[] = ['guru', 'wali_kelas', 'kepala_sekolah', 'lembaga_admin', 'admin', 'yayasan_admin']
export const RAPOR_WRITE_ROLES: Role[] = ['guru', 'wali_kelas', 'kepala_sekolah', 'lembaga_admin', 'admin']

/** Alias lama supaya halaman yang belum diubah tidak pecah. */
export const ADMIN_ROLES = UNIT_ADMIN_ROLES
export const KURIKULUM_ROLES = KURIKULUM_WRITE_ROLES
export const BENDAHARA_ROLES = KEUANGAN_WRITE_ROLES
export const WALI_KELAS_ROLES = WALI_KELAS_WRITE_ROLES
export const GURU_MAPEL_ROLES = ABSENSI_MAPEL_WRITE_ROLES
export const WALI_SANTRI_ROLES = ANAK_SAYA_ROLES

export const ALL_ROLES: Role[] = [
  'admin',
  'kepala_sekolah',
  'lembaga_admin',
  'kurikulum',
  'bendahara',
  'wali_kelas',
  'guru',
  'wali_santri',
  'yayasan_admin',
]

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  kepala_sekolah: 'Kepala Madrasah',
  lembaga_admin: 'Admin Lembaga',
  kurikulum: 'Kurikulum',
  bendahara: 'Bendahara',
  wali_kelas: 'Wali Kelas',
  guru: 'Guru Mapel',
  wali_santri: 'Wali Santri',
  yayasan_admin: 'Admin Yayasan',
}

export function userRoles(user: { role: Role; roles?: Role[] } | null | undefined): Role[] {
  if (!user) return []
  return Array.from(new Set([user.role, ...(user.roles ?? [])]))
}

export function canWrite(role: Role | undefined, writeRoles: Role[]): boolean {
  return !!role && writeRoles.includes(role)
}

export function hasAnyRole(user: { role: Role; roles?: Role[] } | null | undefined, roles: Role[]): boolean {
  return userRoles(user).some((r) => roles.includes(r))
}
