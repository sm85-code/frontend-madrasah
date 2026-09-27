import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { deleteSpp, generateSpp, listSppMenunggu, listSppSemua, paySpp } from '../../api/bendahara'
import { ApiError } from '../../lib/apiClient'
import { Badge } from '../../components/ui/AppBadge'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { DeleteRowButton } from '../../components/ui/DeleteRowButton'
import { ErrorNotice, Spinner, SuccessNotice } from '../../components/ui/Feedback'
import { Input, Label } from '../../components/ui/AppInput'
import { KEUANGAN_WRITE_ROLES } from '../../config/roles'
import { useCanWrite } from '../../hooks/useCanWrite'
import type { Tagihan } from '../../types'

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`
const bulanIni = () => new Date().toISOString().slice(0, 7)

export function SppPage() {
  const queryClient = useQueryClient()
  const writable = useCanWrite(KEUANGAN_WRITE_ROLES)
  const [bulanFilter, setBulanFilter] = useState(bulanIni())
  const menungguQuery = useQuery({ queryKey: ['bendahara', 'menunggu'], queryFn: listSppMenunggu })
  const semuaQuery = useQuery({ queryKey: ['bendahara', 'spp', bulanFilter], queryFn: () => listSppSemua(bulanFilter) })

  const generateMutation = useMutation({
    mutationFn: generateSpp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bendahara'] }),
  })

  const payMutation = useMutation({
    mutationFn: paySpp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bendahara'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSpp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bendahara', 'spp'] }),
  })

  const columns: Column<Tagihan>[] = [
    { header: 'Santri', cell: (t) => t.nama_santri },
    { header: 'Periode', cell: (t) => t.bulan_tahun },
    { header: 'Nominal', cell: (t) => formatRupiah(t.nominal) },
    { header: 'Status', cell: (t) => <Badge tone="warning">{t.status}</Badge> },
    {
      header: 'Aksi',
      cell: (t) =>
        writable ? (
        <Button size="sm" loading={payMutation.isPending} onClick={() => payMutation.mutate(t.id)}>
          Konfirmasi Lunas
        </Button>
        ) : null,
    },
  ]

  const semuaColumns: Column<Tagihan>[] = [
    { header: 'Santri', cell: (t) => t.nama_santri },
    { header: 'Periode', cell: (t) => t.bulan_tahun },
    { header: 'Nominal', cell: (t) => formatRupiah(t.nominal) },
    {
      header: 'Status',
      cell: (t) => <Badge tone={t.lunas ? 'success' : 'warning'}>{t.lunas ? 'Lunas' : 'Belum lunas'}</Badge>,
    },
    {
      header: '',
      className: 'w-10 text-right',
      cell: (t) =>
        t.lunas || !writable ? (
          <span className="text-xs text-muted-foreground" title="Tagihan lunas tidak bisa dihapus (sudah tercatat di buku kas)">
            —
          </span>
        ) : (
          <DeleteRowButton
            onClick={() => deleteMutation.mutate(t.id)}
            pending={deleteMutation.isPending}
            itemName={`tagihan ${t.nama_santri} (${t.bulan_tahun})`}
          />
        ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="SPP / Syahriyah"
        description="Generate tagihan bulanan dan verifikasi pembayaran yang diajukan wali kelas."
        actions={
          {writable && (
          <Button loading={generateMutation.isPending} onClick={() => generateMutation.mutate()}>
            Generate SPP Bulan Ini
          </Button>
          )}
        }
      />

      {generateMutation.isSuccess && (
        <div className="mb-4">
          <SuccessNotice message={`Berhasil generate ${generateMutation.data.length} tagihan.`} />
        </div>
      )}
      {(generateMutation.isError || payMutation.isError) && (
        <div className="mb-4">
          <ErrorNotice
            message={
              (generateMutation.error ?? payMutation.error) instanceof ApiError
                ? ((generateMutation.error ?? payMutation.error) as ApiError).message
                : 'Gagal memproses SPP.'
            }
          />
        </div>
      )}

      <Card className="mb-5">
        <CardBody>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Menunggu Verifikasi</h3>
          {menungguQuery.isLoading ? (
            <Spinner />
          ) : (
            <DataTable columns={columns} rows={menungguQuery.data ?? []} rowKey={(t) => t.id} emptyMessage="Tidak ada pengajuan pembayaran." />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Semua Tagihan</h3>
              <p className="text-sm text-muted-foreground">Hapus tagihan yang salah generate selama belum lunas.</p>
            </div>
            <div>
              <Label htmlFor="bulan-spp">Periode</Label>
              <Input id="bulan-spp" type="month" value={bulanFilter} onChange={(e) => setBulanFilter(e.target.value)} className="w-auto" />
            </div>
          </div>
          {deleteMutation.isError && (
            <div className="mb-3">
              <ErrorNotice
                message={deleteMutation.error instanceof ApiError ? deleteMutation.error.message : 'Gagal menghapus tagihan.'}
              />
            </div>
          )}
          {semuaQuery.isLoading ? (
            <Spinner />
          ) : (
            <DataTable columns={semuaColumns} rows={semuaQuery.data ?? []} rowKey={(t) => t.id} emptyMessage="Belum ada tagihan periode ini." />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
