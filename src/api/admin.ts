import { apiClient } from '../lib/apiClient'
import type {
  AuditLogEntry,
  Kegiatan,
  KkOcrResult,
  Pendaftaran,
  Pengaturan,
  Pengumuman,
  RekapUmum,
  Rombel,
  Santri,
  Tingkat,
  User,
} from '../types'

/** Data kependudukan opsional yang sama di createSantri/patchSantri --
 * diisi manual atau diprefill dari kkOcr() setelah admin memilih baris &
 * memverifikasi/mengedit. */
export interface SantriKependudukan {
  nik?: string | null
  tempat_lahir?: string | null
  tanggal_lahir?: string | null
  jenis_kelamin?: 'L' | 'P' | null
  agama?: string | null
  status_dalam_keluarga?: string | null
  alamat_lengkap?: string | null
  nomor_kk?: string | null
  nama_ayah?: string | null
  nama_ibu?: string | null
  rt_rw?: string | null
  kode_pos?: string | null
  desa_kelurahan?: string | null
  kecamatan?: string | null
  kabupaten_kota?: string | null
  provinsi?: string | null
}

export async function listTugas(userId?: string) {
  const { data } = await apiClient.get<{ id: string; user_id: string; user: string | null; jenis: string; madrasah_unit_id: string }[]>(
    '/admin/tugas',
    { params: userId ? { user_id: userId } : undefined },
  )
  return data
}

export async function createTugas(payload: { user_id: string; jenis: string; madrasah_unit_id?: string }) {
  const { data } = await apiClient.post('/admin/tugas', payload)
  return data
}

export async function deleteTugas(id: string) {
  await apiClient.delete(`/admin/tugas/${id}`)
}

export async function getRekap(): Promise<RekapUmum> {
  const { data } = await apiClient.get<RekapUmum>('/admin/rekap')
  return data
}

export async function listTingkat(): Promise<Tingkat[]> {
  const { data } = await apiClient.get<Tingkat[]>('/admin/tingkat')
  return data
}

export async function createTingkat(payload: { nama: string; urutan: number; madrasah_unit_id?: string }) {
  const { data } = await apiClient.post<Tingkat>('/admin/tingkat', payload)
  return data
}

export async function deleteTingkat(id: string) {
  await apiClient.delete(`/admin/tingkat/${id}`)
}

export async function listRombel(): Promise<Rombel[]> {
  const { data } = await apiClient.get<Rombel[]>('/admin/rombel')
  return data
}

export async function createRombel(payload: {
  nama: string
  tingkat_id?: string | null
  wali_kelas_id?: string | null
  madrasah_unit_id?: string
}) {
  const { data } = await apiClient.post<Rombel>('/admin/rombel', payload)
  return data
}

export async function deleteRombel(id: string) {
  await apiClient.delete(`/admin/rombel/${id}`)
}

export async function listAkun(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>('/admin/akun')
  return data
}

export async function createAkun(payload: {
  nama: string
  no_hp: string
  password?: string
  role: string
  madrasah_unit_id?: string | null
}) {
  const { data } = await apiClient.post<User>('/admin/akun', payload)
  return data
}

export async function patchAkun(
  id: string,
  payload: { nama?: string; no_hp?: string; role?: string; password?: string; madrasah_unit_id?: string | null },
) {
  const { data } = await apiClient.patch<User>(`/admin/akun/${id}`, payload)
  return data
}

export async function deleteAkun(id: string) {
  await apiClient.delete(`/admin/akun/${id}`)
}

export async function listGuru(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>('/admin/guru')
  return data
}

export async function createGuru(payload: {
  nama: string
  no_hp: string
  password?: string
  role?: string
  madrasah_unit_id?: string
}) {
  const { data } = await apiClient.post<User>('/admin/guru', payload)
  return data
}

export async function patchGuru(id: string, payload: { nama?: string; no_hp?: string; role?: string; password?: string }) {
  const { data } = await apiClient.patch<User>(`/admin/guru/${id}`, payload)
  return data
}

export async function deleteGuru(id: string) {
  await apiClient.delete(`/admin/guru/${id}`)
}

export async function listWaliSantri(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>('/admin/wali-santri')
  return data
}

export async function createWaliSantri(payload: { nama: string; no_hp: string; password?: string }) {
  const { data } = await apiClient.post<User>('/admin/wali-santri', payload)
  return data
}

export async function patchWaliSantri(id: string, payload: { nama?: string; no_hp?: string; password?: string }) {
  const { data } = await apiClient.patch<User>(`/admin/wali-santri/${id}`, payload)
  return data
}

export async function deleteWaliSantri(id: string) {
  await apiClient.delete(`/admin/wali-santri/${id}`)
}

export async function listSantriAdmin(status = 'semua'): Promise<Santri[]> {
  const { data } = await apiClient.get<Santri[]>('/admin/santri', { params: { status } })
  return data
}

export async function createSantri(
  payload: {
    nama: string
    nama_wali?: string
    rombel_id?: string | null
    orang_tua_id?: string | null
    madrasah_unit_id?: string
  } & SantriKependudukan,
) {
  const { data } = await apiClient.post<Santri & { wali_username?: string; wali_password_sementara?: string }>(
    '/admin/santri',
    payload,
  )
  return data
}

export async function patchSantri(
  id: string,
  payload: Partial<
    { nama: string; rombel_id: string | null; orang_tua_id: string | null; nama_wali: string; no_hp_wali: string } & SantriKependudukan
  >,
) {
  const { data } = await apiClient.patch<Santri & { wali_username?: string; wali_password_sementara?: string }>(
    `/admin/santri/${id}`,
    payload,
  )
  return data
}

/** Upload foto Kartu Keluarga ke POST /admin/santri/kk-ocr. Backend hanya
 * mengembalikan hasil parsing (belum menyimpan apa pun) -- lihat
 * KkOcrDialog untuk alur pilih baris + verifikasi sebelum createSantri.
 * onUploadProgress (0-100) membantu membedakan "upload macet di jaringan"
 * dari "backend/OCR lambat merespon" saat diagnosa error timeout. */
export async function ocrKartuKeluarga(file: File, onUploadProgress?: (percent: number) => void): Promise<KkOcrResult> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await apiClient.post<KkOcrResult>('/admin/santri/kk-ocr', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 45000,
    onUploadProgress: (e) => {
      if (onUploadProgress && e.total) onUploadProgress(Math.round((e.loaded / e.total) * 100))
    },
  })
  return data
}

export async function deleteSantri(id: string) {
  await apiClient.delete(`/admin/santri/${id}`)
}

export async function placeSantri(santri_id: string, rombel_id: string) {
  const { data } = await apiClient.post('/admin/penempatan', { santri_id, rombel_id })
  return data
}

export async function setSantriStatus(id: string, status: string, tanggal?: string) {
  const { data } = await apiClient.post(`/admin/santri/${id}/status`, { status, tanggal })
  return data
}

export async function getRiwayatKelas(santriId: string) {
  const { data } = await apiClient.get(`/admin/santri/${santriId}/riwayat-kelas`)
  return data
}

export async function kenaikanKelasMassal(items: { santri_id: string; rombel_tujuan_id: string | null }[]) {
  const { data } = await apiClient.post<{ dipindah: string[]; diluluskan: string[] }>('/admin/kenaikan-kelas', {
    items,
  })
  return data
}

export async function listPengumumanAdmin(): Promise<Pengumuman[]> {
  const { data } = await apiClient.get<Pengumuman[]>('/admin/pengumuman')
  return data
}

export async function patchPengumuman(id: string, payload: { judul?: string; isi?: string; publik?: boolean }) {
  const { data } = await apiClient.patch<Pengumuman>(`/admin/pengumuman/${id}`, payload)
  return data
}

export async function deletePengumuman(id: string) {
  await apiClient.delete(`/admin/pengumuman/${id}`)
}

export async function createPengumuman(payload: { judul: string; isi: string }) {
  const { data } = await apiClient.post<Pengumuman>('/admin/pengumuman', payload)
  return data
}

export async function getAuditLog(limit = 200): Promise<AuditLogEntry[]> {
  const { data } = await apiClient.get<AuditLogEntry[]>('/admin/audit-log', { params: { limit } })
  return data
}

export async function updatePengaturan(payload: Partial<Pengaturan>) {
  const { data } = await apiClient.patch<Pengaturan>('/admin/pengaturan', payload)
  return data
}

export async function listKegiatanAdmin(): Promise<Kegiatan[]> {
  const { data } = await apiClient.get<Kegiatan[]>('/admin/kegiatan')
  return data
}

export async function createKegiatan(payload: { judul: string; deskripsi?: string; urutan?: number }) {
  const { data } = await apiClient.post<Kegiatan>('/admin/kegiatan', payload)
  return data
}

export async function deleteKegiatan(id: string) {
  await apiClient.delete(`/admin/kegiatan/${id}`)
}

export async function listPendaftaran(): Promise<Pendaftaran[]> {
  const { data } = await apiClient.get<Pendaftaran[]>('/admin/pendaftaran')
  return data
}

export async function patchPendaftaran(id: string, payload: Partial<Pick<Pendaftaran, 'status' | 'catatan'>>) {
  const { data } = await apiClient.patch<Pendaftaran>(`/admin/pendaftaran/${id}`, payload)
  return data
}
