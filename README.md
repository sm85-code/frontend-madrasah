# Sistem Informasi Madrasah — Frontend

Frontend baru (Fase 5 dari rencana arsitektur) untuk backend
[sm85-arch](https://github.com/sm85-code/sm85-arch), modul madrasah
(`tenants/madrasah`, mounted di `/api/madrasah`).

## Stack

- **React 19 + Vite + TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`, tanpa `postcss.config.js`)
- **React Router** — routing + role guard per portal
- **TanStack Query** — server state / data fetching
- **Zustand** (`persist`) — cache profil user untuk UI saja, bukan session boundary
- **React Hook Form + Zod** — validasi form
- **Recharts** — grafik progres santri
- **axios** — HTTP client, `withCredentials: true` (auth backend berbasis cookie httpOnly)

## Menjalankan

```bash
npm install
cp .env.example .env   # isi VITE_API_BASE_URL sesuai backend
npm run dev
```

`VITE_API_BASE_URL` menunjuk ke root backend sm85-arch (mis.
`http://localhost:8000`); semua request otomatis diarahkan ke
`${VITE_API_BASE_URL}/api/madrasah/...` (lihat `src/lib/apiClient.ts`).

Backend perlu dijalankan dengan CORS yang mengizinkan origin frontend ini
(lihat `shared/config.py` di sm85-arch, `CORS_ORIGINS`/`CORS_ORIGIN_REGEX`).

## Autentikasi

Login (`POST /auth/login`) di backend men-set cookie httpOnly
`madrasah_token` yang divalidasi ulang di setiap request — frontend ini
tidak pernah membaca atau menyimpan token itu sendiri. `useAuthStore`
(Zustand, persisted ke `localStorage`) hanya menyimpan profil user
(nama/role) untuk kebutuhan tampilan (menu sidebar, sapaan) sehingga tidak
ada kedipan "logged out" saat reload — bukan mekanisme keamanan. Response
`401` dari mana pun otomatis membersihkan cache ini dan mengarahkan ke
`/login` (lihat interceptor di `src/lib/apiClient.ts`).

## Struktur

```
src/
  api/          panggilan HTTP per domain (admin, kurikulum, bendahara, ...)
  components/   komponen UI generik (ui/) + layout portal (layout/) + RoleGuard
  config/       daftar role per grup (mirror backend) & konfigurasi menu sidebar
  lib/          axios instance, query client, util class-name
  pages/        satu folder per portal role, isi mengikuti struktur `api/`
  schemas/      skema Zod untuk form
  store/        Zustand store (auth)
  types/        tipe TypeScript, mirror *_out()/dict response backend
```

## Role & portal

Role grup di `src/config/roles.ts` **mirror 1:1** tuple role di
`tenants/madrasah/adapters/api/v1/madrasah_router.py` pada sm85-arch
(`ADMIN_ROLES`, `KURIKULUM_ROLES`, dst). Kalau backend menambah/mengubah
role suatu endpoint, perbarui berkas ini juga supaya sidebar & route guard
tetap konsisten dengan apa yang benar-benar diizinkan backend — backend
tetap menjadi satu-satunya sumber kebenaran otorisasi; guard di sini hanya
mencegah pengguna membuka halaman yang datanya pasti akan ditolak (403).

| Role | Portal |
|---|---|
| `admin`, `kepala_sekolah` | Dashboard, Santri, Rombel & Tingkat, Guru & Wali Santri, Kenaikan Kelas, Tahun Ajaran, Pengumuman, Audit Log, Keuangan |
| `yayasan_admin` (+ admin) | Rekap lintas unit, kelola unit |
| `kurikulum` (+ admin) | Mapel & Materi, Jadwal, Penugasan Guru |
| `bendahara` (+ admin) | SPP / Syahriyah |
| `wali_kelas`, `guru` (+ admin) | Absensi, Progres, Tagihan Kelas, Pesan |
| `guru` (+ wali_kelas, admin) | Penugasan Saya, Absensi Mapel, Rapor |
| `wali_santri` (+ admin) | Progres anak, riwayat tagihan, pesan |

## Status & pengembangan lanjutan

Ini adalah fondasi + implementasi kerja untuk seluruh portal yang sudah
ada di backend (Fase 1–3 sm85-arch: akademik, keuangan/COA, honor,
multi-unit). Kandidat penguatan selanjutnya:

- Code-splitting per rute (bundle saat ini satu chunk ~880 KB gzip ~260 KB
  — belum masalah untuk skala madrasah, tapi `React.lazy` per halaman akan
  membantu begitu jumlah halaman terus bertambah).
- Uji end-to-end (Playwright) untuk jalur kritikal per role.
- Notifikasi WA (Fase 4 rencana arsitektur) begitu backend menyediakan
  endpoint/pemicunya.
