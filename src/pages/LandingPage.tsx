import { useQuery } from '@tanstack/react-query'
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
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div>
            <p className="font-semibold text-primary">{loadingPengaturan ? 'Memuat…' : pengaturan?.nama_sekolah}</p>
            <p className="text-xs text-muted-foreground">{pengaturan?.tagline}</p>
          </div>
          <Link to="/login">
            <Button size="sm">Masuk</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="text-2xl font-semibold text-foreground">Pengumuman</h1>
        <p className="mt-1 text-sm text-muted-foreground">Informasi terbaru dari madrasah.</p>

        <div className="mt-5 space-y-3">
          {loadingPengumuman && <Spinner />}
          {!loadingPengumuman && pengumuman.length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada pengumuman.</p>
          )}
          {pengumuman.map((item) => (
            <Card key={item.id}>
              <CardBody>
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-semibold text-foreground">{item.judul}</h2>
                  <span className="shrink-0 text-xs text-muted-foreground">{item.tanggal}</span>
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{item.isi}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        {pengaturan?.alamat && <p className="mt-10 text-center text-xs text-muted-foreground">{pengaturan.alamat}</p>}
      </main>
    </div>
  )
}
