import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react'
import { useState } from 'react'
import { createBukuKasEntry, getLaporanKeuangan } from '../../api/keuangan'
import { ApiError } from '../../lib/apiClient'
import { Badge } from '../../components/ui/AppBadge'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { Input, Label, Select, Textarea } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import type { BukuKasEntry } from '../../types'
import { KEUANGAN_WRITE_ROLES } from '../../config/roles'
import { useCanWrite } from '../../hooks/useCanWrite'

const formatRupiah = (value: string) => `Rp ${Number(value).toLocaleString('id-ID')}`

export function BukuKasPage() {
  const queryClient = useQueryClient()
  const writable = useCanWrite(KEUANGAN_WRITE_ROLES)
  const [bulan, setBulan] = useState('')
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10))
  const [tipe, setTipe] = useState<'masuk' | 'keluar'>('keluar')
  const [kategori, setKategori] = useState('')
  const [jumlah, setJumlah] = useState('')
  const [keterangan, setKeterangan] = useState('')

  const laporanQuery = useQuery({
    queryKey: ['keuangan', 'laporan', bulan],
    queryFn: () => getLaporanKeuangan(bulan || undefined),
  })

  const mutation = useMutation({
    mutationFn: () =>
      createBukuKasEntry({ tanggal, tipe, kategori, jumlah: Number(jumlah), keterangan }),
    onSuccess: () => {
      setKategori('')
      setJumlah('')
      setKeterangan('')
      queryClient.invalidateQueries({ queryKey: ['keuangan', 'laporan'] })
    },
  })

  const columns: Column<BukuKasEntry>[] = [
    { header: 'Tanggal', cell: (e) => e.tanggal },
    { header: 'Tipe', cell: (e) => <Badge tone={e.tipe === 'masuk' ? 'success' : 'danger'}>{e.tipe}</Badge> },
    { header: 'Kategori', cell: (e) => e.kategori },
    { header: 'Jumlah', cell: (e) => formatRupiah(e.jumlah) },
    { header: 'Keterangan', cell: (e) => e.keterangan },
  ]

  return (
    <div>
      <PageHeader
        title="Buku Kas"
        description="Setiap baris otomatis menghasilkan jurnal berpasangan (lihat Laba Rugi)."
        actions={
          <Input type="month" value={bulan} onChange={(e) => setBulan(e.target.value)} className="w-auto" />
        }
      />

      {laporanQuery.data && (
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Masuk" value={formatRupiah(laporanQuery.data.total_masuk)} tone="success" icon={ArrowUpCircle} />
          <StatCard label="Total Keluar" value={formatRupiah(laporanQuery.data.total_keluar)} tone="danger" icon={ArrowDownCircle} />
          <StatCard label="Saldo" value={formatRupiah(laporanQuery.data.saldo)} icon={Wallet} />
        </div>
      )}

      {writable && (
      <Card className="mb-5">
        <CardBody>
          <form
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
            onSubmit={(e) => {
              e.preventDefault()
              mutation.mutate()
            }}
          >
            <div>
              <Label htmlFor="tanggal-kas">Tanggal</Label>
              <Input id="tanggal-kas" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="tipe-kas">Tipe</Label>
              <Select id="tipe-kas" value={tipe} onChange={(e) => setTipe(e.target.value as 'masuk' | 'keluar')}>
                <option value="masuk">Masuk</option>
                <option value="keluar">Keluar</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="kategori-kas">Kategori</Label>
              <Input id="kategori-kas" placeholder="ATK, Donasi, dll" value={kategori} onChange={(e) => setKategori(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="jumlah-kas">Jumlah</Label>
              <Input id="jumlah-kas" type="number" min={1} value={jumlah} onChange={(e) => setJumlah(e.target.value)} required />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <Label htmlFor="ket-kas">Keterangan</Label>
              <Textarea id="ket-kas" rows={1} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
            </div>
            <Button type="submit" loading={mutation.isPending} className="self-end">
              Catat
            </Button>
          </form>
        </CardBody>
      </Card>
      )}

      <Card>
        <CardBody>
          {laporanQuery.isError ? (
            <ErrorNotice message={laporanQuery.error instanceof ApiError ? laporanQuery.error.message : 'Gagal memuat buku kas.'} />
          ) : laporanQuery.isLoading ? (
            <Spinner />
          ) : (
            <DataTable columns={columns} rows={laporanQuery.data?.entries ?? []} rowKey={(e) => e.id} />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
