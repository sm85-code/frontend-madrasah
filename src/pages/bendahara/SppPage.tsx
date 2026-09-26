import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { generateSpp, listSppMenunggu, paySpp } from '../../api/bendahara'
import { Badge } from '../../components/ui/AppBadge'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Spinner, SuccessNotice } from '../../components/ui/Feedback'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Tagihan } from '../../types'

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

export function SppPage() {
  const queryClient = useQueryClient()
  const menungguQuery = useQuery({ queryKey: ['bendahara', 'menunggu'], queryFn: listSppMenunggu })

  const generateMutation = useMutation({
    mutationFn: generateSpp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bendahara'] }),
  })

  const payMutation = useMutation({
    mutationFn: paySpp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bendahara', 'menunggu'] }),
  })

  const columns: Column<Tagihan>[] = [
    { header: 'Santri', cell: (t) => t.nama_santri },
    { header: 'Periode', cell: (t) => t.bulan_tahun },
    { header: 'Nominal', cell: (t) => formatRupiah(t.nominal) },
    { header: 'Status', cell: (t) => <Badge tone="warning">{t.status}</Badge> },
    {
      header: 'Aksi',
      cell: (t) => (
        <Button size="sm" loading={payMutation.isPending} onClick={() => payMutation.mutate(t.id)}>
          Konfirmasi Lunas
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="SPP / Syahriyah"
        description="Generate tagihan bulanan dan verifikasi pembayaran yang diajukan wali kelas."
        actions={
          <Button loading={generateMutation.isPending} onClick={() => generateMutation.mutate()}>
            Generate SPP Bulan Ini
          </Button>
        }
      />

      {generateMutation.isSuccess && (
        <div className="mb-4">
          <SuccessNotice message={`Berhasil generate ${generateMutation.data.length} tagihan.`} />
        </div>
      )}

      <Card>
        <CardBody>
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Menunggu Verifikasi</h3>
          {menungguQuery.isLoading ? (
            <Spinner />
          ) : (
            <DataTable columns={columns} rows={menungguQuery.data ?? []} rowKey={(t) => t.id} emptyMessage="Tidak ada pengajuan pembayaran." />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
