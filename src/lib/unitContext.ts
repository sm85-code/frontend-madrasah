// Halaman yang tidak dilingkupi satu unit tertentu (yayasan melihat lintas
// unit, audit log & profil pribadi tidak terikat unit) -- tab pemilih unit
// dan label unit di header disembunyikan di sini. Cek /portal/profil pakai
// exact match / prefix "/" supaya TIDAK ikut mencocokkan /portal/profil-lembaga
// (itu justru salah satu halaman yang MEMANG perlu tab unit).
export function hideUnitContext(pathname: string): boolean {
  if (pathname.startsWith('/portal/yayasan')) return true
  if (pathname.startsWith('/portal/audit-log')) return true
  if (pathname === '/portal/profil' || pathname.startsWith('/portal/profil/')) return true
  return false
}
