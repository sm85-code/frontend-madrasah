import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getPengaturan, getPengumuman } from '../api/public'
import { Spotlight } from '../components/aceternity/Spotlight'
import { CardSpotlight } from '../components/aceternity/CardSpotlight'
import { CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
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
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <Spotlight className="h-[40rem]" />
      <header className="relative border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div>
            <p className="font-semibold text-teal-800">{loadingPengaturan ? 'Memuat…' : pengaturan?.nama_sekolah}</p>
            <p className="text-xs text-slate-500">{pengaturan?.tagline}</p>
          </div>
          <Link to="/login">
            <Button size="sm">Masuk</Button>
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-4xl px-5 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-semibold text-slate-900">Pengumuman</h1>
          <p className="mt-1 text-sm text-slate-500">Informasi terbaru dari madrasah.</p>
        </motion.div>

        <div className="mt-5 space-y-3">
          {loadingPengumuman && <Spinner />}
          {!loadingPengumuman && pengumuman.length === 0 && (
            <p className="text-sm text-slate-500">Belum ada pengumuman.</p>
          )}
          {pengumuman.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
            >
              <CardSpotlight>
                <CardBody>
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-semibold text-slate-800">{item.judul}</h2>
                    <span className="shrink-0 text-xs text-slate-400">{item.tanggal}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{item.isi}</p>
                </CardBody>
              </CardSpotlight>
            </motion.div>
          ))}
        </div>

        {pengaturan?.alamat && <p className="mt-10 text-center text-xs text-slate-400">{pengaturan.alamat}</p>}
      </main>
    </div>
  )
}
