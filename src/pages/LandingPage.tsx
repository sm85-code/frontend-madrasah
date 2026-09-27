import { useQuery } from '@tanstack/react-query'
import { ClipboardCheck, GraduationCap, Megaphone, MessageCircle, TrendingUp, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getPengaturan, getPengumuman } from '../api/public'
import { Card, CardBody } from '../components/ui/AppCard'
import { Button } from '../components/ui/AppButton'
import { Spinner } from '../components/ui/Feedback'

const LAYANAN = [
  {
    icon: ClipboardCheck,
    title: 'Absensi & Kehadiran',
    description: 'Kehadiran santri dicatat setiap hari dan bisa dipantau wali kelas maupun wali santri.',
  },
  {
    icon: TrendingUp,
    title: 'Progres Akademik',
    description: 'Perkembangan hafalan dan capaian belajar santri tercatat rapi, bukan sekadar nilai akhir.',
  },
  {
    icon: Wallet,
    title: 'SPP & Pembayaran',
    description: 'Tagihan SPP transparan, wali santri bisa memantau status pembayaran kapan saja.',
  },
  {
    icon: MessageCircle,
    title: 'Komunikasi Wali & Guru',
    description: 'Percakapan langsung antara wali kelas dan orang tua/wali santri, per anak.',
  },
] as const

export function LandingPage() {
  const { data: pengaturan, isLoading: loadingPengaturan } = useQuery({
    queryKey: ['pengaturan'],
    queryFn: getPengaturan,
  })
  const { data: pengumumanRaw, isLoading: loadingPengumuman } = useQuery({
    queryKey: ['pengumuman-publik'],
    queryFn: getPengumuman,
  })
  // Defensive: only ever render this as a list. If VITE_API_BASE_URL is
  // misconfigured, a relative request can resolve against this same dev
  // server/host instead of the backend and come back non-JSON -- fail
  // quiet (empty list) instead of crashing the whole public landing page.
  const pengumuman = Array.isArray(pengumumanRaw) ? pengumumanRaw : []

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-4.5" strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{loadingPengaturan ? 'Memuat…' : pengaturan?.nama_sekolah}</p>
              <p className="truncate text-xs text-muted-foreground">{pengaturan?.tagline}</p>
            </div>
          </div>
          <Link to="/login" className="shrink-0">
            <Button size="sm">Masuk</Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% -10%, var(--accent), transparent)',
            }}
          />
          <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:py-24">
            <span className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
              <GraduationCap className="size-7" strokeWidth={2.25} />
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {loadingPengaturan ? 'Memuat…' : pengaturan?.nama_sekolah ?? 'Sistem Informasi Madrasah'}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
              {pengaturan?.tagline ?? 'Satu portal untuk absensi, progres akademik, SPP, dan komunikasi wali santri.'}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/login">
                <Button>Masuk ke Portal</Button>
              </Link>
              <a href="#pengumuman">
                <Button variant="secondary">Lihat Pengumuman</Button>
              </a>
            </div>
          </div>
        </section>

        {/* Layanan */}
        <section className="mx-auto max-w-5xl px-5 py-14 sm:py-16">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Layanan dalam Satu Portal</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Dipakai bersama oleh admin, guru, bendahara, dan wali santri sesuai perannya masing-masing.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LAYANAN.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="shadow-soft transition-shadow hover:shadow-md">
                <CardBody>
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                    <Icon className="size-5" strokeWidth={2.25} />
                  </span>
                  <h3 className="mt-3 font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* Pengumuman */}
        <section id="pengumuman" className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-3xl px-5 py-14 sm:py-16">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Pengumuman</h2>
              <p className="mt-1 text-sm text-muted-foreground">Informasi terbaru dari madrasah.</p>
            </div>

            <div className="space-y-3">
              {loadingPengumuman && <Spinner />}
              {!loadingPengumuman && pengumuman.length === 0 && (
                <Card className="border-dashed shadow-none">
                  <CardBody className="flex flex-col items-center gap-2 py-10 text-center">
                    <Megaphone className="size-6 text-muted-foreground" strokeWidth={1.75} />
                    <p className="text-sm text-muted-foreground">Belum ada pengumuman.</p>
                  </CardBody>
                </Card>
              )}
              {pengumuman.map((item) => (
                <Card key={item.id} className="shadow-soft transition-shadow hover:shadow-md">
                  <CardBody>
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-semibold text-foreground">{item.judul}</h3>
                      <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{item.tanggal}</span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-sm text-muted-foreground">{item.isi}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-5 py-8 text-center">
          <p className="font-semibold text-foreground">{pengaturan?.nama_sekolah}</p>
          {pengaturan?.alamat && <p className="mt-1 text-sm text-muted-foreground">{pengaturan.alamat}</p>}
          <p className="mt-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {pengaturan?.nama_sekolah ?? 'Sistem Informasi Madrasah'}. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  )
}
