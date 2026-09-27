import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PortalLayout } from './components/layout/PortalLayout'
import { RoleGuard } from './components/RoleGuard'
import { ADMIN_ROLES, BENDAHARA_ROLES, GURU_MAPEL_ROLES, KURIKULUM_ROLES, WALI_KELAS_ROLES, WALI_SANTRI_ROLES, YAYASAN_ROLES } from './config/roles'
import { queryClient } from './lib/queryClient'
import { AdminAuditLogPage } from './pages/admin/AdminAuditLogPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminGuruPage } from './pages/admin/AdminGuruPage'
import { AdminKenaikanKelasPage } from './pages/admin/AdminKenaikanKelasPage'
import { AdminPendaftaranPage } from './pages/admin/AdminPendaftaranPage'
import { AdminPengaturanPage } from './pages/admin/AdminPengaturanPage'
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
import { LabaRugiPage } from './pages/keuangan/LabaRugiPage'
import { JadwalPage } from './pages/kurikulum/JadwalPage'
import { MapelPage } from './pages/kurikulum/MapelPage'
import { PenugasanPage } from './pages/kurikulum/PenugasanPage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PortalIndexPage } from './pages/PortalIndexPage'
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

              <Route element={<RoleGuard roles={ADMIN_ROLES} />}>
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="santri" element={<AdminSantriPage />} />
                <Route path="rombel" element={<AdminRombelPage />} />
                <Route path="guru" element={<AdminGuruPage />} />
                <Route path="kenaikan-kelas" element={<AdminKenaikanKelasPage />} />
                <Route path="tahun-ajaran" element={<AdminTahunAjaranPage />} />
                <Route path="pengumuman" element={<AdminPengumumanPage />} />
                <Route path="pendaftaran" element={<AdminPendaftaranPage />} />
                <Route path="pengaturan" element={<AdminPengaturanPage />} />
                <Route path="audit-log" element={<AdminAuditLogPage />} />
                <Route path="keuangan/buku-kas" element={<BukuKasPage />} />
                <Route path="keuangan/laba-rugi" element={<LabaRugiPage />} />
                <Route path="keuangan/honor" element={<HonorPage />} />
              </Route>

              <Route element={<RoleGuard roles={YAYASAN_ROLES} />}>
                <Route path="yayasan" element={<YayasanPage />} />
              </Route>

              <Route element={<RoleGuard roles={KURIKULUM_ROLES} />}>
                <Route path="kurikulum/mapel" element={<MapelPage />} />
                <Route path="kurikulum/jadwal" element={<JadwalPage />} />
                <Route path="kurikulum/penugasan" element={<PenugasanPage />} />
              </Route>

              <Route element={<RoleGuard roles={BENDAHARA_ROLES} />}>
                <Route path="bendahara/spp" element={<SppPage />} />
              </Route>

              <Route element={<RoleGuard roles={WALI_KELAS_ROLES} />}>
                <Route path="wali-kelas/absensi" element={<WaliKelasAbsensiPage />} />
                <Route path="wali-kelas/progres" element={<WaliKelasProgresPage />} />
                <Route path="wali-kelas/tagihan" element={<WaliKelasTagihanPage />} />
                <Route path="wali-kelas/pesan" element={<WaliKelasPesanPage />} />
              </Route>

              <Route element={<RoleGuard roles={GURU_MAPEL_ROLES} />}>
                <Route path="guru-mapel/penugasan" element={<PenugasanSayaPage />} />
                <Route path="guru-mapel/absensi" element={<AbsensiMapelPage />} />
                <Route path="guru-mapel/rapor" element={<RaporPage />} />
              </Route>

              <Route element={<RoleGuard roles={WALI_SANTRI_ROLES} />}>
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
