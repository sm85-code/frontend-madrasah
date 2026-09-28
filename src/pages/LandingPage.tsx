import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  Megaphone,
  MessageCircle,
  Phone,
  School,
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
import { sortUnitsByJenjang } from '../lib/units'
import { cn } from '../lib/utils'

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

const UNIT_ICONS = [BookOpen, School, Building2] as const

const brandTitleShadow =
  '[text-shadow:0_1px_2px_rgba(15,23,42,0.2),0_0_20px_rgba(255,255,255,0.55)]'
const brandHeaderShadow =
  '[text-shadow:0_1px_2px_rgba(15,23,42,0.18),0_0_12px_rgba(255,255,255,0.5)]'

function waLink(kontak: string) {
  const digits = kontak.replace(/[^0-9]/g, '')
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  return `https://wa.me/${normalized}`
}

function SectionHeading({
  title,
  subtitle,
  align = 'center',
  className,
}: {
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <div className={cn(align === 'center' ? 'mx-auto max-w-xl text-center' : 'max-w-2xl', className)}>
      <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-[1.65rem] sm:leading-snug">
        {title}
      </h2>
      {subtitle ? (
        <p className={cn('mt-2.5 text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]', align === 'center' && 'mx-auto max-w-lg')}>
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

type UnitFilter = 'semua' | string

function UnitFilterChips({
  units,
  value,
  onChange,
  align = 'center',
}: {
  units: { id: string; nama: string }[]
  value: UnitFilter
  onChange: (next: UnitFilter) => void
  align?: 'center' | 'left'
}) {
  if (units.length <= 1) return null
  return (
    <div className={cn('mt-6 flex flex-wrap items-center gap-2', align === 'center' ? 'justify-center' : 'justify-start')}>
      <button
        type="button"
        onClick={() => onChange('semua')}
        className={cn(
          'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
          value === 'semua'
            ? 'bg-primary text-primary-foreground shadow-soft'
            : 'bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        Semua
      </button>
      {units.map((u) => (
        <button
          key={u.id}
          type="button"
          onClick={() => onChange(u.id)}
          className={cn(
            'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
            value === u.id
              ? 'bg-primary text-primary-foreground shadow-soft'
              : 'bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          {u.nama}
        </button>
      ))}
    </div>
  )
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
  const { data: unitPublik, isLoading: loadingUnits } = useQuery({
    queryKey: ['unit-publik'],
    queryFn: listUnitPublik,
  })
  const [filterKegiatan, setFilterKegiatan] = useState<UnitFilter>('semua')
  const [filterPengumuman, setFilterPengumuman] = useState<UnitFilter>('semua')

  const namaUnit = (item: { madrasah_unit_id?: string | null; unit_nama?: string | null }) =>
    item.unit_nama || unitPublik?.find((u) => u.id === item.madrasah_unit_id)?.nama
  const pengumuman = Array.isArray(pengumumanRaw) ? pengumumanRaw : []
  const kegiatan = Array.isArray(kegiatanRaw) ? kegiatanRaw : []
  const units = sortUnitsByJenjang(Array.isArray(unitPublik) ? unitPublik : [])
  const infoPsb = pengaturan?.info_psb?.trim()
  const kontakPsb = pengaturan?.kontak_psb?.trim()
  const brandName = pengaturan?.nama_sekolah ?? 'Sistem Informasi Madrasah'
  const alamat = pengaturan?.alamat?.trim()

  const collectFilterUnits = (
    items: { madrasah_unit_id?: string | null; unit_nama?: string | null }[],
  ) => {
    const fromItems = new Map<string, string>()
    for (const item of items) {
      const id = item.madrasah_unit_id
      const nama = namaUnit(item)
      if (id && nama) fromItems.set(id, nama)
    }
    if (fromItems.size > 0) {
      return sortUnitsByJenjang(Array.from(fromItems.entries()).map(([id, nama]) => ({ id, nama })))
    }
    return units
  }
  const kegiatanFilterUnits = collectFilterUnits(kegiatan)
  const pengumumanFilterUnits = collectFilterUnits(pengumuman)

  const filteredKegiatan =
    filterKegiatan === 'semua'
      ? kegiatan
      : kegiatan.filter(
          (k) =>
            k.madrasah_unit_id === filterKegiatan ||
            namaUnit(k) === kegiatanFilterUnits.find((u) => u.id === filterKegiatan)?.nama,
        )

  const filteredPengumuman =
    filterPengumuman === 'semua'
      ? pengumuman
      : pengumuman.filter(
          (p) =>
            p.madrasah_unit_id === filterPengumuman ||
            namaUnit(p) === pengumumanFilterUnits.find((u) => u.id === filterPengumuman)?.nama,
        )

  return (
    <div className="auth-bg relative min-h-screen">
      <WallpaperLayer />

      <header className="sticky top-0 z-20 border-b border-transparent backdrop-blur-md supports-[backdrop-filter]:bg-[color-mix(in_oklch,var(--bg)_72%,transparent)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3.5 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark logoUrl={pengaturan?.logo_url} name={pengaturan?.nama_sekolah} />
            <div className="min-w-0 leading-tight">
              <p className={cn('truncate font-heading text-sm font-semibold tracking-tight', brandHeaderShadow)}>
                {loadingPengaturan ? 'Memuat…' : brandName}
              </p>
              <p className="mt-0.5 truncate text-xs leading-snug text-muted-foreground">{pengaturan?.tagline}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <Link
              to="/pendaftaran"
              className="hidden rounded-lg px-2 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground sm:inline"
            >
              Pendaftaran
            </Link>
            <AppearancePopover align="end" />
            <Link to="/login">
              <Button size="sm" variant="secondary">
                Masuk
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-[1]">
        <section className="mx-auto max-w-3xl px-5 pt-12 pb-8 text-center sm:pt-16 sm:pb-10">
          <p
            className="mb-6 inline-flex items-center rounded-full px-3.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] sm:mb-7 sm:text-xs"
            style={{ background: 'var(--primary-light)', color: 'var(--text-secondary)' }}
          >
            Portal Madrasah · Informasi Publik
          </p>
          <BrandMark logoUrl={pengaturan?.logo_url} name={brandName} size="lg" className="mx-auto mb-3.5" />
          <h1
            className={cn(
              'mx-auto max-w-md font-heading text-xl font-semibold leading-snug tracking-tight sm:text-2xl',
              brandTitleShadow,
            )}
          >
            {loadingPengaturan ? 'Memuat…' : brandName}
          </h1>
          <p
            className="mx-auto mt-3.5 max-w-lg text-sm leading-relaxed sm:mt-4 sm:text-[0.975rem] sm:leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {pengaturan?.tagline ?? 'Satu portal untuk absensi, progres akademik, SPP, dan komunikasi wali santri.'}
          </p>
          {alamat ? (
            <p className="mx-auto mt-2.5 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {alamat}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:mt-9 sm:gap-3">
            <Link to="/pendaftaran">
              <Button className="min-w-[10.5rem]">Daftar Jadi Santri Baru</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="min-w-[10.5rem]">
                Masuk ke Portal
              </Button>
            </Link>
          </div>
        </section>

        {(loadingUnits || units.length > 0) && (
          <section className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
            <SectionHeading
              title="Unit & Jenjang"
              subtitle="Beberapa jalur pendidikan di bawah yayasan. Pilih unit sesuai usia dan jenjang."
            />
            {loadingUnits ? (
              <div className="mt-10">
                <Spinner />
              </div>
            ) : (
              <div className="mt-10 grid gap-3.5 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {units.map((unit, index) => {
                  const Icon = UNIT_ICONS[index % UNIT_ICONS.length]
                  return (
                    <Card
                      key={unit.id}
                      className="h-full border-[var(--legacy-border)] bg-[color-mix(in_oklch,var(--surface)_92%,transparent)] shadow-soft transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <CardBody className="flex h-full flex-col p-5 sm:p-6">
                        <span
                          className="flex size-11 items-center justify-center rounded-2xl"
                          style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}
                        >
                          <Icon className="size-5" strokeWidth={2.25} />
                        </span>
                        <h3 className="mt-4 font-heading text-[0.975rem] font-semibold leading-snug tracking-tight text-foreground">
                          {unit.nama}
                        </h3>
                        <div className="mt-auto pt-4">
                          <Link to={`/pendaftaran?unit=${encodeURIComponent(unit.id)}`}>
                            <Button size="sm" variant="secondary">
                              Daftar ke unit ini
                            </Button>
                          </Link>
                        </div>
                      </CardBody>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>
        )}

        <section className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
          <SectionHeading
            title="Layanan dalam Satu Portal"
            subtitle="Dipakai bersama oleh admin, guru, bendahara, dan wali santri sesuai perannya masing-masing."
          />

          <div className="mt-10 grid gap-3.5 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {LAYANAN.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="h-full border-[var(--legacy-border)] bg-[color-mix(in_oklch,var(--surface)_92%,transparent)] shadow-soft transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardBody className="flex h-full flex-col p-5 sm:p-6">
                  <span
                    className="flex size-11 items-center justify-center rounded-2xl"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}
                  >
                    <Icon className="size-5" strokeWidth={2.25} />
                  </span>
                  <h3 className="mt-4 font-heading text-[0.975rem] font-semibold leading-snug tracking-tight text-foreground">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {infoPsb && (
          <section className="mx-auto max-w-3xl px-5 pb-12 sm:pb-16">
            <div className="mx-auto max-w-xl text-center">
              <span
                className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl shadow-soft"
                style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}
              >
                <CalendarCheck className="size-6" strokeWidth={2.25} />
              </span>
              <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-[1.65rem] sm:leading-snug">
                Penerimaan Santri Baru
              </h2>
            </div>
            <Card className="mt-8 overflow-hidden border-[var(--legacy-border)] bg-[color-mix(in_oklch,var(--surface)_94%,transparent)] shadow-soft">
              <CardBody className="space-y-5 p-5 sm:p-7">
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground sm:text-[0.9375rem]">
                  {infoPsb}
                </p>
                {kontakPsb && (
                  <a
                    href={waLink(kontakPsb)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-primary transition-colors hover:underline"
                  >
                    <Phone className="size-4" strokeWidth={2} />
                    Hubungi Panitia PSB: {kontakPsb}
                  </a>
                )}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <Link to="/pendaftaran">
                    <Button size="sm">Buka Formulir Pendaftaran</Button>
                  </Link>
                  {units.length > 0 &&
                    units.map((u) => (
                      <Link key={u.id} to={`/pendaftaran?unit=${encodeURIComponent(u.id)}`}>
                        <Button size="sm" variant="secondary">
                          Daftar {u.nama}
                        </Button>
                      </Link>
                    ))}
                </div>
              </CardBody>
            </Card>
          </section>
        )}

        <section className="mx-auto max-w-5xl px-5 pb-12 sm:pb-16">
          <div
            className="rounded-[1.35rem] px-5 py-10 sm:px-9 sm:py-12"
            style={{
              background: 'color-mix(in oklch, var(--surface) 90%, transparent)',
              border: '1px solid var(--legacy-border)',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <SectionHeading
              title="Kegiatan & Program"
              subtitle="Kegiatan unggulan yang diikuti santri di madrasah ini."
            />
            <UnitFilterChips units={kegiatanFilterUnits} value={filterKegiatan} onChange={setFilterKegiatan} />
            {loadingKegiatan ? (
              <div className="mt-10">
                <Spinner />
              </div>
            ) : kegiatan.length === 0 ? (
              <p className="mt-10 text-center text-sm leading-relaxed text-muted-foreground">
                Belum ada kegiatan yang ditampilkan.
              </p>
            ) : filteredKegiatan.length === 0 ? (
              <p className="mt-10 text-center text-sm leading-relaxed text-muted-foreground">
                Tidak ada kegiatan untuk unit ini.
              </p>
            ) : (
              <div className="mt-10 grid gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {filteredKegiatan.map((k) => (
                  <Card
                    key={k.id}
                    className="h-full border-[var(--legacy-border)] bg-[color-mix(in_oklch,var(--surface)_96%,transparent)] shadow-soft transition-shadow hover:shadow-md"
                  >
                    <CardBody className="flex h-full flex-col p-5">
                      <span
                        className="flex size-11 items-center justify-center rounded-2xl"
                        style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}
                      >
                        <Sparkles className="size-5" strokeWidth={2.25} />
                      </span>
                      <h3 className="mt-4 font-heading text-[0.975rem] font-semibold leading-snug tracking-tight text-foreground">
                        {k.judul}
                      </h3>
                      {namaUnit(k) && (
                        <Badge tone="info" className="mt-2 w-fit">
                          {namaUnit(k)}
                        </Badge>
                      )}
                      {k.deskripsi && (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{k.deskripsi}</p>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="pengumuman" className="mx-auto max-w-3xl px-5 pb-16 sm:pb-20">
          <SectionHeading
            align="left"
            title="Pengumuman"
            subtitle="Informasi terbaru dari madrasah."
            className="mb-4 sm:mb-5"
          />
          <div className="mb-8 sm:mb-9">
            <UnitFilterChips
              units={pengumumanFilterUnits}
              value={filterPengumuman}
              onChange={setFilterPengumuman}
              align="left"
            />
          </div>

          <div className="space-y-3.5">
            {loadingPengumuman && <Spinner />}
            {!loadingPengumuman && pengumuman.length === 0 && (
              <Card className="border-dashed bg-[color-mix(in_oklch,var(--surface)_80%,transparent)] shadow-none">
                <CardBody className="flex flex-col items-center gap-2.5 py-12 text-center">
                  <Megaphone className="size-7 text-muted-foreground/80" strokeWidth={1.75} />
                  <p className="text-sm text-muted-foreground">Belum ada pengumuman.</p>
                </CardBody>
              </Card>
            )}
            {!loadingPengumuman && pengumuman.length > 0 && filteredPengumuman.length === 0 && (
              <p className="text-sm text-muted-foreground">Tidak ada pengumuman untuk unit ini.</p>
            )}
            {filteredPengumuman.map((item) => (
              <Card
                key={item.id}
                className="border-[var(--legacy-border)] bg-[color-mix(in_oklch,var(--surface)_94%,transparent)] shadow-soft transition-shadow hover:shadow-md"
              >
                <CardBody className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-2.5 sm:gap-3">
                    <h3 className="min-w-0 flex-1 font-heading text-[0.975rem] font-semibold leading-snug tracking-tight text-foreground">
                      {item.judul}
                    </h3>
                    <span className="shrink-0 rounded-full bg-muted/90 px-2.5 py-1 text-[0.6875rem] font-medium tabular-nums tracking-wide text-muted-foreground">
                      {item.tanggal}
                    </span>
                  </div>
                  {namaUnit(item) && (
                    <Badge tone="info" className="mt-2.5 w-fit">
                      {namaUnit(item)}
                    </Badge>
                  )}
                  <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {item.isi}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-[1] border-t border-[var(--legacy-border)] bg-[color-mix(in_oklch,var(--surface)_55%,transparent)]">
        <div className="mx-auto max-w-5xl px-5 py-8 text-center sm:py-10">
          <p className="font-heading text-sm font-semibold tracking-tight text-foreground">{pengaturan?.nama_sekolah}</p>
          {pengaturan?.alamat && (
            <p className="mx-auto mt-1.5 max-w-lg text-sm leading-relaxed text-muted-foreground">{pengaturan.alamat}</p>
          )}
          <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-sm">
            <Link to="/pendaftaran" className="text-muted-foreground transition-colors hover:text-foreground">
              Pendaftaran
            </Link>
            <Link to="/login" className="text-muted-foreground transition-colors hover:text-foreground">
              Masuk
            </Link>
            <a href="#pengumuman" className="text-muted-foreground transition-colors hover:text-foreground">
              Pengumuman
            </a>
          </nav>
          <p className="mt-5 text-xs tracking-wide text-muted-foreground">
            © {new Date().getFullYear()} {brandName}. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  )
}
