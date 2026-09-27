import { useMutation, useQuery } from '@tanstack/react-query'
import {
  CalendarCheck,
  ClipboardCheck,
  GraduationCap,
  Megaphone,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { getKegiatan, getPengaturan, getPengumuman, listUnitPublik, submitPendaftaran } from '../api/public'
import { ApiError } from '../lib/apiClient'
import { AppearancePopover } from '../components/AppearancePopover'
import { Card, CardBody } from '../components/ui/AppCard'
import { Button } from '../components/ui/AppButton'
import { ErrorNotice, Spinner, SuccessNotice } from '../components/ui/Feedback'
import { Input, Label, Select, Textarea } from '../components/ui/AppInput'

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

function PendaftaranForm() {
  const unitQuery = useQuery({ queryKey: ['unit-publik'], queryFn: listUnitPublik })
  const [form, setForm] = useState({
    nama_calon: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    nama_orang_tua: '',
    no_hp: '',
    alamat: '',
    asal_sekolah: '',
    catatan: '',
    madrasah_unit_id: '',
  })

  const mutation = useMutation({
    mutationFn: () => submitPendaftaran(form),
    onSuccess: () => {
      setForm({
        nama_calon: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        nama_orang_tua: '',
        no_hp: '',
        alamat: '',
        asal_sekolah: '',
        catatan: '',
        madrasah_unit_id: '',
      })
    },
  })

  const set = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  if (mutation.isSuccess) {
    return (
      <Card className="shadow-soft">
        <CardBody className="flex flex-col items-center gap-2 py-10 text-center">
          <SuccessNotice message="Pendaftaran berhasil dikirim. Kami akan menghubungi Anda segera." />
          <Button variant="secondary" onClick={() => mutation.reset()} className="mt-2">
            Daftarkan Calon Lain
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="shadow-soft">
      <CardBody>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            mutation.mutate()
          }}
        >
          <div>
            <Label htmlFor="nama_calon">Nama calon santri</Label>
            <Input id="nama_calon" value={form.nama_calon} onChange={set('nama_calon')} required />
          </div>
          <div>
            <Label htmlFor="nama_orang_tua">Nama orang tua/wali</Label>
            <Input id="nama_orang_tua" value={form.nama_orang_tua} onChange={set('nama_orang_tua')} required />
          </div>
          <div>
            <Label htmlFor="tempat_lahir">Tempat lahir</Label>
            <Input id="tempat_lahir" value={form.tempat_lahir} onChange={set('tempat_lahir')} />
          </div>
          <div>
            <Label htmlFor="tanggal_lahir">Tanggal lahir</Label>
            <Input id="tanggal_lahir" type="date" value={form.tanggal_lahir} onChange={set('tanggal_lahir')} />
          </div>
          <div>
            <Label htmlFor="no_hp">No. HP/WhatsApp aktif</Label>
            <Input id="no_hp" placeholder="0812xxxxxxxx" value={form.no_hp} onChange={set('no_hp')} required />
          </div>
          <div>
            <Label htmlFor="asal_sekolah">Asal sekolah (jika ada)</Label>
            <Input id="asal_sekolah" value={form.asal_sekolah} onChange={set('asal_sekolah')} />
          </div>
          <div>
            <Label htmlFor="madrasah_unit_id">Unit / lembaga</Label>
            <Select id="madrasah_unit_id" value={form.madrasah_unit_id} onChange={set('madrasah_unit_id')} required>
              <option value="">Pilih unit</option>
              {unitQuery.data?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea id="alamat" rows={2} value={form.alamat} onChange={set('alamat')} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="catatan">Catatan (opsional)</Label>
            <Textarea id="catatan" rows={2} value={form.catatan} onChange={set('catatan')} />
          </div>

          {mutation.isError && (
            <div className="sm:col-span-2">
              <ErrorNotice
                message={
                  mutation.error instanceof ApiError
                    ? mutation.error.message
                    : 'Gagal mengirim pendaftaran, coba lagi.'
                }
              />
            </div>
          )}

          <Button type="submit" loading={mutation.isPending} className="sm:col-span-2 sm:w-fit">
            <Send className="size-4" strokeWidth={2} />
            Kirim Pendaftaran
          </Button>
        </form>
      </CardBody>
    </Card>
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
  const { data: unitPublik } = useQuery({
    queryKey: ['unit-publik'],
    queryFn: listUnitPublik,
  })
  const namaUnit = (id?: string | null) => unitPublik?.find((u) => u.id === id)?.nama
  // Defensive: only ever render these as lists. If VITE_API_BASE_URL is
  // misconfigured, a relative request can resolve against this same dev
  // server/host instead of the backend and come back non-JSON -- fail
  // quiet (empty list) instead of crashing the whole public landing page.
  const pengumuman = Array.isArray(pengumumanRaw) ? pengumumanRaw : []
  const kegiatan = Array.isArray(kegiatanRaw) ? kegiatanRaw : []
  const infoPsb = pengaturan?.info_psb?.trim()
  const kontakPsb = pengaturan?.kontak_psb?.trim()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 shadow-soft backdrop-blur">
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
          <div className="flex shrink-0 items-center gap-1">
            <AppearancePopover />
            <Link to="/login">
              <Button size="sm">Masuk</Button>
            </Link>
          </div>
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
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {loadingPengaturan ? 'Memuat…' : pengaturan?.nama_sekolah ?? 'Sistem Informasi Madrasah'}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
              {pengaturan?.tagline ?? 'Satu portal untuk absensi, progres akademik, SPP, dan komunikasi wali santri.'}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#daftar">
                <Button>Daftar Jadi Santri Baru</Button>
              </a>
              <Link to="/login">
                <Button variant="secondary">Masuk ke Portal</Button>
              </Link>
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
                  <h3 className="mt-3 text-base font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* Kegiatan */}
        {(loadingKegiatan || kegiatan.length > 0) && (
          <section className="border-t border-border bg-muted/30">
            <div className="mx-auto max-w-5xl px-5 py-14 sm:py-16">
              <div className="mx-auto max-w-xl text-center">
                <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Kegiatan & Program</h2>
                <p className="mt-2 text-sm text-muted-foreground">Kegiatan unggulan yang diikuti santri di madrasah ini.</p>
              </div>
              {loadingKegiatan ? (
                <div className="mt-8">
                  <Spinner />
                </div>
              ) : (
                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {kegiatan.map((k) => (
                    <Card key={k.id} className="shadow-soft">
                      <CardBody>
                        <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                          <Sparkles className="size-5" strokeWidth={2.25} />
                        </span>
                        <h3 className="mt-3 text-base font-semibold text-foreground">{k.judul}</h3>
                        {namaUnit(k.madrasah_unit_id) && (
                          <p className="mt-1 text-xs text-muted-foreground">{namaUnit(k.madrasah_unit_id)}</p>
                        )}
                        {k.deskripsi && <p className="mt-1 text-sm text-muted-foreground">{k.deskripsi}</p>}
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* PSB */}
        {infoPsb && (
          <section className="border-t border-border">
            <div className="mx-auto max-w-3xl px-5 py-14 sm:py-16">
              <div className="mx-auto max-w-xl text-center">
                <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
                  <CalendarCheck className="size-6" strokeWidth={2.25} />
                </span>
                <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Penerimaan Santri Baru</h2>
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
                </CardBody>
              </Card>
            </div>
          </section>
        )}

        {/* Formulir Pendaftaran */}
        <section id="daftar" className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-3xl px-5 py-14 sm:py-16">
            <div className="mb-8 text-center">
              <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Formulir Pendaftaran Calon Santri</h2>
              <p className="mt-2 text-sm text-muted-foreground">Isi data di bawah, panitia PSB akan menghubungi Anda.</p>
            </div>
            <PendaftaranForm />
          </div>
        </section>

        {/* Pengumuman */}
        <section id="pengumuman" className="border-t border-border">
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
                      <h3 className="text-base font-semibold text-foreground">{item.judul}</h3>
                      <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{item.tanggal}</span>
                    </div>
                    {namaUnit(item.madrasah_unit_id) && (
                      <p className="mt-1 text-xs text-muted-foreground">{namaUnit(item.madrasah_unit_id)}</p>
                    )}
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
