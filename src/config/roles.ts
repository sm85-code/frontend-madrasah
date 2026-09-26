import type { Role } from '../types'

// Mirrors the role-group tuples in sm85-arch's
// tenants/madrasah/adapters/api/v1/madrasah_router.py -- keep both in sync.
export const ADMIN_ROLES: Role[] = ['admin', 'kepala_sekolah']
export const KURIKULUM_ROLES: Role[] = ['kurikulum', 'kepala_sekolah', 'admin']
export const BENDAHARA_ROLES: Role[] = ['bendahara', 'kepala_sekolah', 'admin']
export const WALI_KELAS_ROLES: Role[] = ['wali_kelas', 'guru', 'kepala_sekolah', 'admin']
export const GURU_MAPEL_ROLES: Role[] = ['guru', 'wali_kelas', 'kepala_sekolah', 'admin']
export const WALI_SANTRI_ROLES: Role[] = ['wali_santri', 'kepala_sekolah', 'admin']
export const YAYASAN_ROLES: Role[] = ['yayasan_admin', 'kepala_sekolah', 'admin']

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  kepala_sekolah: 'Kepala Sekolah',
  kurikulum: 'Kurikulum',
  bendahara: 'Bendahara',
  wali_kelas: 'Wali Kelas',
  guru: 'Guru Mapel',
  wali_santri: 'Wali Santri',
  yayasan_admin: 'Yayasan',
}
