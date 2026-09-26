import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { listRombelScoped } from '../../api/shared'
import { ajukanPembayaran, getTagihanRombel } from '../../api/waliKelas'
import { Badge } from '../../components/ui/AppBadge'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Label, Select } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Tagihan } from '../../types'

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`
const TONE: Record<Tagihan['status'], 'success' | 'warning' | 'neutral'> = {
  Lunas: 'success',
  'Menunggu Verifikasi': 'warning',
  'Belum Bayar': 'neutral',
}

export function WaliKelasTagihanPage() {
  const queryClient = useQueryClient()
  const rombelQuery = useQuery({ queryKey: ['scoped', 'rombel'], queryFn: listRombelScoped })
  const [rombelId, setRombelId] = useState('')

  const tagihanQuery = useQuery({
    queryKey: ['wali-kelas', 'tagihan', rombelId],
    queryFn: () => getTagihanRombel(rombelId),
    enabled: !!rombelId,
  })

  const ajukanMutation = useMutation({
    mutationFn: ajukanPembayaran,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wali-kelas', 'tagihan'] }),
  })

  const columns: Column<Tagihan>[] = [
    { header: 'Santri', cell: (t) => t.nama_santri },
    { header: 'Periode', cell: (t) => t.bulan_tahun },
    { header: 'Nominal', cell: (t) => formatRupiah(t.nominal) },
    { header: 'Status', cell: (t) => <Badge tone={TONE[t.status]}>{t.status}</Badge> },
    {
      header: 'Aksi',
      cell: (t) =>
        t.status === 'Belum Bayar' && (
          <Button size="sm" loading={ajukanMutation.isPending} onClick={() => ajukanMutation.mutate(t.id)}>
            Ajukan Sudah Bayar
          </Button>
        ),
    },
  ]

  return (
    <div>
      <PageHeader title="Tagihan SPP Rombel" description="Ajukan konfirmasi pembayaran tunai ke bendahara." />

      <Card>
        <CardBody>
          <div className="mb-4 max-w-xs">
            <Label htmlFor="rombel-tagihan">Rombel</Label>
            <Select id="rombel-tagihan" value={rombelId} onChange={(e) => setRombelId(e.target.value)}>
              <option value="">Pilih rombel</option>
              {rombelQuery.data?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </Select>
          </div>
          {rombelId && <DataTable columns={columns} rows={tagihanQuery.data ?? []} rowKey={(t) => t.id} />}
        </CardBody>
      </Card>
    </div>
  )
}
