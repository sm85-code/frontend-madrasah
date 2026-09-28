import { useQuery } from '@tanstack/react-query'
import {
  CalendarCheck,
  ClipboardCheck,
  Megaphone,
  MessageCircle,
  Phone,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getKegiatan, getPengaturan, getPengumuman, listUnitPublik } from '../api/public'
import { AppearancePopover } from '../components/AppearancePopover'
import { BrandMark } from '../components/BrandMark'
import { WallpaperLayer } from '../components/WallpaperLayer'
import { Badge } from '../components/ui/AppBadge'
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

function waLink(kontak: string) {
  const digits = kontak.replace(/[^0-9]/g, '')
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  return `https://wa.me/${normalized}`
}

export function LandingPage() {
  const { data: pengaturan, isLoading: loadingPengaturan } = useQuery({
    queryKey: ['pengaturan'],
    queryFn: getPengaturan,
  })
  const { data: pengumumanRaw, isLoading: loadingPengumuman } = useQuery({
    queryKey: ['pengumuman-publik'],
    queryFn: getPengumuman,
  })
  const { data: kegiatanRaw, isLoading: loadingKegiatan } = useQuery({
    queryKey: ['kegiatan-publik'],
    queryFn: getKegiatan,
  })
  const { data: unitPublik } = useQuery({
    queryKey: ['unit-publik'],
    queryFn: listUnitPublik,
  })
  const namaUnit = (item: { madrasah_unit_id?: string | null; unit_nama?: string | null }) =>
    item.unit_nama || unitPublik?.find((u) => u.id === item.madrasah_unit_id)?.nama
  const pengumuman = Array.isArray(pengumumanRaw) ? pengumumanRaw : []
  const kegiatan = Array.isArray(kegiatanRaw) ? kegiatanRaw : []
  const infoPsb = pengaturan?.info_psb?.trim()
  const kontakPsb = pengaturan?.kontak_psb?.trim()
  const brandName = pengaturan?.nama_sekolah ?? 'Sistem Informasi Madrasah'

  return (
    <div className="auth-bg relative min-h-screen">
      <WallpaperLayer />

      <header className="relative z-[1] mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 pt-6">
        <div className="flex min-w-0 items-center gap-3">
          <BrandMark logoUrl={pengaturan?.logo_url} name={pengaturan?.nama_sekolah} />
          <div className="min-w-0 leading-tight">
            <p className="truncate font-heading text-[1.05rem] font-semibold">
              {loadingPengaturan ? 'Memuat…' : brandName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{pengaturan?.tagline}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link to="/pendaftaran" className="hidden text-sm font-medium text-foreground hover:underline sm:inline">
            Pendaftaran
          </Link>
          <AppearancePopover align="end" />
          <Link to="/login">
            <Button size="sm" variant="secondary">
              Masuk
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-[1]">
        <section className="mx-auto max-w-3xl px-5 pt-10 pb-6 text-center">
          <p
            className="mb-5 inline-block rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.14em]"
            style={{ background: 'var(--primary-light)', color: 'var(--text-secondary)' }}
          >
            Portal Madrasah · Informasi Publik
          </p>
          <BrandMark logoUrl={pengaturan?.logo_url} name={brandName} size="lg" className="mx-auto mb-5" />
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-5xl">
            {loadingPengaturan ? 'Memuat…' : brandName}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
            {pengaturan?.tagline ?? 'Satu portal untuk absensi, progres akademik, SPP, dan komunikasi wali santri.'}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/pendaftaran">
              <Button>Daftar Jadi Santri Baru</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary">Masuk ke Portal</Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-heading text-xl font-semibold sm:text-2xl">Layanan dalam Satu Portal</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Dipakai bersama oleh admin, guru, bendahara, dan wali santri sesuai perannya masing-masing.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LAYANAN.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="shadow-soft transition-shadow hover:shadow-md">
                <CardBody>
                  <span
                    className="flex size-10 items-center justify-center rounded-xl"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}
                  >
                    <Icon className="size-5" strokeWidth={2.25} />
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 pb-10 sm:pb-14">
          <div
            className="rounded-2xl px-5 py-10 sm:px-8"
            style={{
              background: 'color-mix(in oklch, var(--surface) 88%, transparent)',
              border: '1px solid var(--legacy-border)',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <div className="mx-auto max-w-xl text-center">
              <h2 className="font-heading text-xl font-semibold sm:text-2xl">Kegiatan & Program</h2>
              <p className="mt-2 text-sm text-muted-foreground">Kegiatan unggulan yang diikuti santri di madrasah ini.</p>
            </div>
            {loadingKegiatan ? (
              <div className="mt-8">
                <Spinner />
              </div>
            ) : kegiatan.length === 0 ? (
              <p className="mt-8 text-center text-sm text-muted-foreground">Belum ada kegiatan yang ditampilkan.</p>
            ) : (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {kegiatan.map((k) => (
                  <Card key={k.id} className="shadow-soft">
                    <CardBody>
                      <span
                        className="flex size-10 items-center justify-center rounded-xl"
                        style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}
                      >
                        <Sparkles className="size-5" strokeWidth={2.25} />
                      </span>
                      <h3 className="mt-3 text-base font-semibold text-foreground">{k.judul}</h3>
                      {namaUnit(k) && (
                        <Badge tone="info" className="mt-1.5">
                          {namaUnit(k)}
                        </Badge>
                      )}
                      {k.deskripsi && <p className="mt-1 text-sm text-muted-foreground">{k.deskripsi}</p>}
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {infoPsb && (
          <section className="mx-auto max-w-3xl px-5 pb-10 sm:pb-14">
            <div className="mx-auto max-w-xl text-center">
              <span
                className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl"
                style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}
              >
                <CalendarCheck className="size-6" strokeWidth={2.25} />
              </span>
              <h2 className="font-heading text-xl font-semibold sm:text-2xl">Penerimaan Santri Baru</h2>
            </div>
            <Card className="mt-8 shadow-soft">
              <CardBody>
                <p className="whitespace-pre-line text-sm text-foreground">{infoPsb}</p>
                {kontakPsb && (
                  <a
                    href={waLink(kontakPsb)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    <Phone className="size-4" strokeWidth={2} />
                    Hubungi Panitia PSB: {kontakPsb}
                  </a>
                )}
                <div className="mt-4">
                  <Link to="/pendaftaran">
                    <Button size="sm">Buka Formulir Pendaftaran</Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </section>
        )}

        <section id="pengumuman" className="mx-auto max-w-3xl px-5 pb-14 sm:pb-16">
          <div className="mb-8">
            <h2 className="font-heading text-xl font-semibold sm:text-2xl">Pengumuman</h2>
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
                    <h3 className="text-base font-semibold text-foreground">{item.judul}</h3>
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{item.tanggal}</span>
                  </div>
                  {namaUnit(item) && (
                    <Badge tone="info" className="mt-1.5">
                      {namaUnit(item)}
                    </Badge>
                  )}
                  <p className="mt-1.5 whitespace-pre-line text-sm text-muted-foreground">{item.isi}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-[1] mx-auto max-w-5xl px-5 pb-8 text-center text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">{pengaturan?.nama_sekolah}</p>
        {pengaturan?.alamat && <p className="mt-1 text-sm text-muted-foreground">{pengaturan.alamat}</p>}
        <p className="mt-4">
          © {new Date().getFullYear()} {brandName}. Seluruh hak cipta dilindungi.
        </p>
      </footer>
    </div>
  )
}
