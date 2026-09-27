import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { generateHonor, listHonor, payHonor } from '../../api/keuangan'
import { ApiError } from '../../lib/apiClient'
import { Badge } from '../../components/ui/AppBadge'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { Input } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Honor } from '../../types'

const formatRupiah = (value: string) => `Rp ${Number(value).toLocaleString('id-ID')}`

export function HonorPage() {
  const queryClient = useQueryClient()
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7))

  const honorQuery = useQuery({ queryKey: ['keuangan', 'honor', bulan], queryFn: () => listHonor(bulan || undefined) })

  const generateMutation = useMutation({
    mutationFn: () => generateHonor(bulan || undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['keuangan', 'honor'] }),
  })

  const payMutation = useMutation({
    mutationFn: payHonor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['keuangan', 'honor'] }),
  })

  const columns: Column<Honor>[] = [
    { header: 'Guru', cell: (h) => h.guru ?? '-' },
    { header: 'Mapel', cell: (h) => h.mapel ?? '-' },
    { header: 'Jumlah Sesi', cell: (h) => h.jumlah_sesi },
    { header: 'Tarif/Sesi', cell: (h) => formatRupiah(h.tarif_per_sesi) },
    { header: 'Total', cell: (h) => formatRupiah(h.total) },
    {
      header: 'Status',
      cell: (h) => <Badge tone={h.status_bayar ? 'success' : 'warning'}>{h.status_bayar ? 'Lunas' : 'Belum'}</Badge>,
    },
    {
      header: 'Aksi',
      cell: (h) =>
        !h.status_bayar && (
          <Button size="sm" loading={payMutation.isPending} onClick={() => payMutation.mutate(h.id)}>
            Bayar
          </Button>
        ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Honor Mengajar"
        description="Dihitung dari sesi absensi yang benar-benar dicatat guru per bulan."
        actions={
          <>
            <Input type="month" value={bulan} onChange={(e) => setBulan(e.target.value)} className="w-auto" />
            <Button loading={generateMutation.isPending} onClick={() => generateMutation.mutate()}>
              Generate Bulan Ini
            </Button>
          </>
        }
      />
      {(generateMutation.isError || payMutation.isError) && (
        <div className="mb-4">
          <ErrorNotice
            message={
              (generateMutation.error ?? payMutation.error) instanceof ApiError
                ? ((generateMutation.error ?? payMutation.error) as ApiError).message
                : 'Gagal memproses honor.'
            }
          />
        </div>
      )}
      <Card>
        <CardBody>{honorQuery.isLoading ? <Spinner /> : <DataTable columns={columns} rows={honorQuery.data ?? []} rowKey={(h) => h.id} />}</CardBody>
      </Card>
    </div>
  )
}
