import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { generateHonor, listHonor, payHonor } from '../../api/keuangan'
import { ApiError } from '../../lib/apiClient'
import { Badge } from '../../components/ui/AppBadge'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { ErrorNotice, Spinner, SuccessNotice } from '../../components/ui/Feedback'
import { Input, Label } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Honor } from '../../types'
import { KEUANGAN_WRITE_ROLES } from '../../config/roles'
import { useCanWrite } from '../../hooks/useCanWrite'

const formatRupiah = (value: string) => `Rp ${Number(value).toLocaleString('id-ID')}`

export function HonorPage() {
  const queryClient = useQueryClient()
  const writable = useCanWrite(KEUANGAN_WRITE_ROLES)
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7))
  const [tarifHonor, setTarifHonor] = useState('')

  const honorQuery = useQuery({ queryKey: ['keuangan', 'honor', bulan], queryFn: () => listHonor(bulan || undefined) })

  const generateMutation = useMutation({
    mutationFn: () => generateHonor(bulan || undefined, tarifHonor ? Number(tarifHonor) : undefined),
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
    { header: 'Nilai Bisyaroh/Pertemuan', cell: (h) => formatRupiah(h.tarif_per_sesi) },
    { header: 'Total', cell: (h) => formatRupiah(h.total) },
    {
      header: 'Status',
      cell: (h) => <Badge tone={h.status_bayar ? 'success' : 'warning'}>{h.status_bayar ? 'Lunas' : 'Belum'}</Badge>,
    },
    {
      header: 'Aksi',
      cell: (h) =>
        !h.status_bayar && writable && (
          <Button size="sm" loading={payMutation.isPending} onClick={() => payMutation.mutate(h.id)}>
            Bayar
          </Button>
        ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Bisyaroh"
        description='Dihitung dari "Absensi Mapel" yang dicatat guru (bukan absensi harian wali kelas) -- guru yang belum pernah mengisi absensi mapel di bulan ini tidak akan muncul.'
        actions={
          <div className="flex flex-wrap items-end gap-2">
            <Input type="month" value={bulan} onChange={(e) => setBulan(e.target.value)} className="w-auto" />
            {writable && (
              <>
                <div>
                  <Label htmlFor="tarif-honor">Nilai Bisyaroh/Pertemuan (opsional)</Label>
                  <Input
                    id="tarif-honor"
                    type="number"
                    min={1}
                    step={1000}
                    placeholder="Default unit"
                    value={tarifHonor}
                    onChange={(e) => setTarifHonor(e.target.value)}
                    className="w-40"
                  />
                </div>
                <Button loading={generateMutation.isPending} onClick={() => generateMutation.mutate()}>
                  Generate Bulan Ini
                </Button>
              </>
            )}
          </div>
        }
      />
      {generateMutation.isSuccess && (
        <div className="mb-4">
          {generateMutation.data.length > 0 ? (
            <SuccessNotice message={`Berhasil generate ${generateMutation.data.length} baris honor.`} />
          ) : (
            <SuccessNotice message="Tidak ada honor baru -- semua guru mapel untuk bulan ini belum punya sesi Absensi Mapel yang tercatat, atau honornya sudah pernah di-generate sebelumnya." />
          )}
        </div>
      )}
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
