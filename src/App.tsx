import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PortalLayout } from './components/layout/PortalLayout'
import { RoleGuard } from './components/RoleGuard'
import {
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
} from './config/roles'
import { queryClient } from './lib/queryClient'
import { AdminAuditLogPage } from './pages/admin/AdminAuditLogPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminGuruPage } from './pages/admin/AdminGuruPage'
import { AdminKelolaAkunPage } from './pages/admin/AdminKelolaAkunPage'
import { AdminKenaikanKelasPage } from './pages/admin/AdminKenaikanKelasPage'
import { AdminPendaftaranPage } from './pages/admin/AdminPendaftaranPage'
import { AdminPengaturanPage } from './pages/admin/AdminPengaturanPage'
import { AdminProfilLembagaPage } from './pages/admin/AdminProfilLembagaPage'
import { AdminPengumumanPage } from './pages/admin/AdminPengumumanPage'
import { AdminRombelPage } from './pages/admin/AdminRombelPage'
import { AdminSantriPage } from './pages/admin/AdminSantriPage'
import { AdminTahunAjaranPage } from './pages/admin/AdminTahunAjaranPage'
import { SppPage } from './pages/bendahara/SppPage'
import { AbsensiMapelPage } from './pages/guruMapel/AbsensiMapelPage'
import { PenugasanSayaPage } from './pages/guruMapel/PenugasanSayaPage'
import { RaporPage } from './pages/guruMapel/RaporPage'
import { BukuKasPage } from './pages/keuangan/BukuKasPage'
import { HonorPage } from './pages/keuangan/HonorPage'
import { JadwalPage } from './pages/kurikulum/JadwalPage'
import { MapelPage } from './pages/kurikulum/MapelPage'
import { PenugasanPage } from './pages/kurikulum/PenugasanPage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PortalIndexPage } from './pages/PortalIndexPage'
import { ProfilSayaPage } from './pages/ProfilSayaPage'
import { WaliKelasAbsensiPage } from './pages/waliKelas/WaliKelasAbsensiPage'
import { WaliKelasPesanPage } from './pages/waliKelas/WaliKelasPesanPage'
import { WaliKelasProgresPage } from './pages/waliKelas/WaliKelasProgresPage'
import { WaliKelasTagihanPage } from './pages/waliKelas/WaliKelasTagihanPage'
import { WaliSantriPage } from './pages/waliSantri/WaliSantriPage'
import { YayasanPage } from './pages/yayasan/YayasanPage'

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route path="/portal" element={<PortalLayout />}>
              <Route index element={<PortalIndexPage />} />
              <Route path="profil" element={<ProfilSayaPage />} />

              <Route element={<RoleGuard roles={DASHBOARD_ROLES} />}>
                <Route path="dashboard" element={<AdminDashboardPage />} />
              </Route>
              <Route element={<RoleGuard roles={SANTRI_READ_ROLES} />}>
                <Route path="santri" element={<AdminSantriPage />} />
              </Route>
              <Route element={<RoleGuard roles={ROMBEL_READ_ROLES} />}>
                <Route path="rombel" element={<AdminRombelPage />} />
              </Route>
              <Route element={<RoleGuard roles={KENAIKAN_READ_ROLES} />}>
                <Route path="kenaikan-kelas" element={<AdminKenaikanKelasPage />} />
              </Route>
              <Route element={<RoleGuard roles={INFO_AKADEMIK_READ_ROLES} />}>
                <Route path="tahun-ajaran" element={<AdminTahunAjaranPage />} />
                <Route path="pengumuman" element={<AdminPengumumanPage />} />
                <Route path="pengaturan" element={<AdminPengaturanPage />} />
              </Route>
              <Route element={<RoleGuard roles={PSB_READ_ROLES} />}>
                <Route path="pendaftaran" element={<AdminPendaftaranPage />} />
              </Route>
              <Route element={<RoleGuard roles={PROFIL_LEMBAGA_READ_ROLES} />}>
                <Route path="profil-lembaga" element={<AdminProfilLembagaPage />} />
              </Route>
              <Route element={<RoleGuard roles={KEUANGAN_READ_ROLES} />}>
                <Route path="keuangan/buku-kas" element={<BukuKasPage />} />
                <Route path="keuangan/honor" element={<HonorPage />} />
              </Route>

              <Route element={<RoleGuard roles={UNIT_ACCOUNT_READ_ROLES} />}>
                <Route path="guru" element={<AdminGuruPage />} />
              </Route>

              <Route element={<RoleGuard roles={APP_ADMIN_ROLES} />}>
                <Route path="kelola-akun" element={<AdminKelolaAkunPage />} />
                <Route path="audit-log" element={<AdminAuditLogPage />} />
              </Route>

              <Route element={<RoleGuard roles={YAYASAN_ROLES} />}>
                <Route path="yayasan" element={<YayasanPage />} />
                <Route path="yayasan/profil" element={<YayasanPage />} />
              </Route>

              <Route element={<RoleGuard roles={KURIKULUM_READ_ROLES} />}>
                <Route path="kurikulum/mapel" element={<MapelPage />} />
                <Route path="kurikulum/jadwal" element={<JadwalPage />} />
                <Route path="kurikulum/penugasan" element={<PenugasanPage />} />
              </Route>

              <Route element={<RoleGuard roles={KEUANGAN_READ_ROLES} />}>
                <Route path="bendahara/spp" element={<SppPage />} />
              </Route>

              <Route element={<RoleGuard roles={ABSENSI_REKAP_ROLES} />}>
                <Route path="wali-kelas/absensi" element={<WaliKelasAbsensiPage />} />
              </Route>
              <Route element={<RoleGuard roles={WALI_KELAS_READ_ROLES} />}>
                <Route path="wali-kelas/progres" element={<WaliKelasProgresPage />} />
                <Route path="wali-kelas/tagihan" element={<WaliKelasTagihanPage />} />
              </Route>
              <Route element={<RoleGuard roles={PESAN_ROLES} />}>
                <Route path="wali-kelas/pesan" element={<WaliKelasPesanPage />} />
              </Route>

              <Route element={<RoleGuard roles={PENUGASAN_SAYA_ROLES} />}>
                <Route path="guru-mapel/penugasan" element={<PenugasanSayaPage />} />
              </Route>
              <Route element={<RoleGuard roles={ABSENSI_MAPEL_READ_ROLES} />}>
                <Route path="guru-mapel/absensi" element={<AbsensiMapelPage />} />
              </Route>
              <Route element={<RoleGuard roles={RAPOR_READ_ROLES} />}>
                <Route path="guru-mapel/rapor" element={<RaporPage />} />
              </Route>

              <Route element={<RoleGuard roles={ANAK_SAYA_ROLES} />}>
                <Route path="wali-santri" element={<WaliSantriPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
