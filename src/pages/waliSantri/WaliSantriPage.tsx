import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { listSantriScoped } from '../../api/shared'
import { getProgresAnak, getTagihanAnak, kirimPesanAnak, listPesanAnak } from '../../api/waliSantri'
import { Badge } from '../../components/ui/AppBadge'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Spinner } from '../../components/ui/Feedback'
import { Label, Select, Textarea } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Tagihan } from '../../types'

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`
const TONE: Record<Tagihan['status'], 'success' | 'warning' | 'neutral'> = {
  Lunas: 'success',
  'Menunggu Verifikasi': 'warning',
  'Belum Bayar': 'neutral',
}

export function WaliSantriPage() {
  const queryClient = useQueryClient()
  const anakQuery = useQuery({ queryKey: ['wali-santri', 'anak'], queryFn: () => listSantriScoped() })
  const [santriId, setSantriId] = useState('')
  const [isi, setIsi] = useState('')

  const progresQuery = useQuery({
    queryKey: ['wali-santri', 'progres', santriId],
    queryFn: () => getProgresAnak(santriId),
    enabled: !!santriId,
  })
  const tagihanQuery = useQuery({
    queryKey: ['wali-santri', 'tagihan', santriId],
    queryFn: () => getTagihanAnak(santriId),
    enabled: !!santriId,
  })
  const pesanQuery = useQuery({
    queryKey: ['wali-santri', 'pesan', santriId],
    queryFn: () => listPesanAnak(santriId),
    enabled: !!santriId,
  })

  const kirimMutation = useMutation({
    mutationFn: () => kirimPesanAnak(santriId, isi),
    onSuccess: () => {
      setIsi('')
      queryClient.invalidateQueries({ queryKey: ['wali-santri', 'pesan', santriId] })
    },
  })

  const tagihanColumns: Column<Tagihan>[] = [
    { header: 'Periode', cell: (t) => t.bulan_tahun },
    { header: 'Nominal', cell: (t) => formatRupiah(t.nominal) },
    { header: 'Status', cell: (t) => <Badge tone={TONE[t.status]}>{t.status}</Badge> },
  ]

  const chartData = (progresQuery.data ?? []).map((p, i) => ({ index: i + 1, tanggal: p.tanggal, capaian: p.capaian }))

  return (
    <div>
      <PageHeader title="Anak Saya" description="Progres, tagihan, dan pesan dengan wali kelas." />

      <Card className="mb-5">
        <CardBody>
          <div className="max-w-xs">
            <Label htmlFor="pilih-anak">Pilih anak</Label>
            <Select id="pilih-anak" value={santriId} onChange={(e) => setSantriId(e.target.value)}>
              <option value="">Pilih anak</option>
              {anakQuery.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama}
                </option>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {santriId && (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Progres</CardTitle>
            </CardHeader>
            <CardBody>
              {progresQuery.isLoading ? (
                <Spinner />
              ) : chartData.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada progres tercatat.</p>
              ) : (
                <div className="h-56 w-full">
                  <ResponsiveContainer>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} />
                      <YAxis hide />
                      <Tooltip />
                      <Line type="monotone" dataKey="index" stroke="#0f766e" strokeWidth={2} dot name="Progres ke-" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="mt-3 space-y-1 text-sm">
                {progresQuery.data?.map((p) => (
                  <div key={p.id} className="flex justify-between border-b border-border py-1 last:border-0">
                    <span className="text-muted-foreground">{p.tanggal}</span>
                    <span className="text-foreground">{p.capaian}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Riwayat Tagihan SPP</CardTitle>
            </CardHeader>
            <CardBody>
              {tagihanQuery.isLoading ? <Spinner /> : <DataTable columns={tagihanColumns} rows={tagihanQuery.data ?? []} rowKey={(t) => t.id} />}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pesan dengan Wali Kelas</CardTitle>
            </CardHeader>
            <CardBody>
              {pesanQuery.isLoading ? (
                <Spinner />
              ) : (
                <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
                  {pesanQuery.data?.map((p) => (
                    <div key={p.id} className="rounded-lg bg-muted/40 px-3 py-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {p.dari_nama} · {new Date(p.dibuat_pada).toLocaleString('id-ID')}
                      </p>
                      <p className="text-sm text-foreground">{p.isi}</p>
                    </div>
                  ))}
                  {pesanQuery.data?.length === 0 && <p className="text-sm text-muted-foreground">Belum ada pesan.</p>}
                </div>
              )}
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  kirimMutation.mutate()
                }}
              >
                <Textarea rows={2} placeholder="Tulis pesan…" value={isi} onChange={(e) => setIsi(e.target.value)} required />
                <Button type="submit" loading={kirimMutation.isPending}>
                  Kirim
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
