// Shapes mirror the *_out()/dict responses in sm85-arch's
// tenants/madrasah/modules/madrasah/application/services.py. Keep both
// sides in sync manually -- there is no shared schema generation yet.

export type Role =
  | 'admin'
  | 'kepala_sekolah'
  | 'lembaga_admin'
  | 'kurikulum'
  | 'bendahara'
  | 'wali_kelas'
  | 'guru'
  | 'wali_santri'
  | 'yayasan_admin'

export interface User {
  id: string
  nama: string
  no_hp: string
  role: Role
  madrasah_unit_id?: string | null
  // Hanya terisi sekali, tepat setelah akun dibuat tanpa password
  // manual -- server generate password acak dan mengembalikannya di
  // respons create (bukan field yang tersimpan/bisa dibaca ulang).
  password_sementara?: string
}

export interface Pengaturan {
  nama_sekolah: string
  tagline: string
  logo_url: string | null
  alamat: string
  info_psb: string
  kontak_psb: string
}

export interface Kegiatan {
  id: string
  judul: string
  deskripsi: string
  urutan: number
  madrasah_unit_id?: string | null
}

export interface Pendaftaran {
  id: string
  nama_calon: string
  tempat_lahir: string | null
  tanggal_lahir: string | null
  nama_orang_tua: string
  no_hp: string
  alamat: string
  asal_sekolah: string | null
  catatan: string
  status: 'baru' | 'dihubungi' | 'diterima' | 'ditolak'
  dibuat_pada: string
  madrasah_unit_id?: string | null
}

export interface Pengumuman {
  id: string
  judul: string
  isi: string
  tanggal: string
  dibuat_by: string | null
  madrasah_unit_id?: string | null
}

export interface Tingkat {
  id: string
  nama: string
  urutan: number
  madrasah_unit_id?: string | null
}

export interface Rombel {
  id: string
  nama: string
  tingkat_id: string | null
  wali_kelas_id: string | null
  wali_kelas: string | null
  madrasah_unit_id?: string | null
}

export interface Santri {
  id: string
  nama: string
  rombel_id: string | null
  kelas_id?: string | null
  orang_tua_id: string | null
  orang_tua?: string | null
  status?: 'aktif' | 'lulus' | 'keluar' | 'pindah'
  madrasah_unit_id?: string | null
}

export interface Mapel {
  id: string
  kode: string
  nama: string
  materi: MateriTarget[]
  madrasah_unit_id?: string | null
}

export interface MateriTarget {
  id: string
  judul: string
  urutan: number
  aktif: boolean
  mapel_id?: string
}

export interface Jadwal {
  id: string
  rombel_id: string
  mapel_id: string
  mapel: string | null
  hari: string
  jam_mulai: string
  jam_selesai: string
}

export interface Penugasan {
  id: string
  guru_id: string
  guru: string | null
  mapel_id: string
  mapel: string | null
  rombel_id: string
  rombel: string | null
}

export interface Tagihan {
  id: string
  santri_id: string
  nama: string
  nama_santri: string
  bulan_tahun: string
  nominal: number
  status: 'Belum Bayar' | 'Menunggu Verifikasi' | 'Lunas'
  status_bayar: boolean
  lunas: boolean
  diajukan_oleh: string | null
  diajukan_pada: string | null
  dibayar_pada: string | null
}

export interface ProgresEntry {
  id: string
  tanggal: string
  tipe: string
  capaian: string
  catatan_guru: string
  mapel_id: string | null
  materi_id: string | null
}

export interface Pesan {
  id: string
  isi: string
  dari_nama: string
  dari_role: Role | null
  dibuat_pada: string
}

export interface BukuKasEntry {
  id: string
  tanggal: string
  tipe: 'masuk' | 'keluar'
  kategori: string
  jumlah: string
  keterangan: string
}

export interface LaporanKeuangan {
  total_masuk: string
  total_keluar: string
  saldo: string
  entries: BukuKasEntry[]
}

export interface Akun {
  kode: string
  nama: string
  tipe: 'aset' | 'kewajiban' | 'ekuitas' | 'pendapatan' | 'beban'
}

export interface JurnalEntry {
  id: string
  tanggal: string
  akun_debit: string
  akun_kredit: string
  jumlah: string
  keterangan: string
  sumber_tipe: string
  sumber_id: string | null
}

export interface LabaRugi {
  pendapatan: { kode: string; nama: string; jumlah: string }[]
  beban: { kode: string; nama: string; jumlah: string }[]
  total_pendapatan: string
  total_beban: string
  laba_bersih: string
}

export interface Honor {
  id: string
  guru_id: string
  guru: string | null
  mapel_id: string | null
  mapel: string | null
  bulan_tahun: string
  jumlah_sesi: number
  tarif_per_sesi: string
  total: string
  status_bayar: boolean
  dibayar_pada: string | null
}

export interface TahunAjaran {
  id: string
  kode: string
  tanggal_mulai: string
  tanggal_selesai: string
  madrasah_unit_id?: string | null
}

export interface Semester {
  id: string
  tahun_ajaran_id: string
  tahun_ajaran: string | null
  nama: 'Ganjil' | 'Genap'
  tanggal_mulai: string
  tanggal_selesai: string
  status: 'draft' | 'aktif' | 'ditutup'
}

export interface RiwayatKelasEntry {
  id: string
  rombel_id: string
  rombel: string | null
  tanggal_masuk: string
  tanggal_keluar: string | null
}

export interface RekapUmum {
  total_santri: number
  total_guru: number
  total_rombel: number
  tagihan_lunas: number
  tagihan_belum: number
  per_rombel: { rombel: string; jumlah_santri: number }[]
  unit_id?: string | null
  unit_nama?: string | null
}

export interface AuditLogEntry {
  id: string
  waktu: string
  aktor_nama: string
  aktor_role: string
  aksi: string
  entitas: string
  entitas_id: string | null
  keterangan: string
  ip: string
}

export interface Yayasan {
  id: string
  nama: string
  alamat: string
}

export interface MadrasahUnit {
  id: string
  nama: string
  alamat: string
  kepala_unit: string
  aktif: boolean
}

export interface RekapUnit {
  unit_id: string
  unit_nama: string
  aktif: boolean
  total_santri: number
  total_rombel: number
  total_guru: number
  tagihan_lunas: number
  tagihan_belum: number
}
