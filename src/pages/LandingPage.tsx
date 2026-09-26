import { useQuery } from '@tanstack/react-query'
import { GraduationCap, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getPengaturan, getPengumuman } from '../api/public'
import { Card, CardBody } from '../components/ui/AppCard'
import { Button } from '../components/ui/AppButton'
import { Spinner } from '../components/ui/Feedback'

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
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-5 py-4">
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

      <main className="mx-auto max-w-4xl px-5 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Pengumuman</h1>
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
                  <h2 className="font-semibold text-foreground">{item.judul}</h2>
                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{item.tanggal}</span>
                </div>
                <p className="mt-1.5 whitespace-pre-line text-sm text-muted-foreground">{item.isi}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        {pengaturan?.alamat && <p className="mt-10 text-center text-xs text-muted-foreground">{pengaturan.alamat}</p>}
      </main>
    </div>
  )
}
