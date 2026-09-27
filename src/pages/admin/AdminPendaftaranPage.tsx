import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listPendaftaran, patchPendaftaran } from '../../api/admin'
import { ApiError } from '../../lib/apiClient'
import { Badge } from '../../components/ui/AppBadge'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Pendaftaran } from '../../types'

const STATUS_TONE: Record<Pendaftaran['status'], 'neutral' | 'info' | 'success' | 'danger'> = {
  baru: 'neutral',
  dihubungi: 'info',
  diterima: 'success',
  ditolak: 'danger',
}

const STATUS_LABEL: Record<Pendaftaran['status'], string> = {
  baru: 'Baru',
  dihubungi: 'Dihubungi',
  diterima: 'Diterima',
  ditolak: 'Ditolak',
}

export function AdminPendaftaranPage() {
  const queryClient = useQueryClient()
  const pendaftaranQuery = useQuery({ queryKey: ['admin', 'pendaftaran'], queryFn: listPendaftaran })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Pendaftaran['status'] }) => patchPendaftaran(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'pendaftaran'] }),
  })

  const columns: Column<Pendaftaran>[] = [
    { header: 'Calon Santri', cell: (p) => p.nama_calon },
    { header: 'Orang Tua/Wali', cell: (p) => p.nama_orang_tua },
    { header: 'No. HP', cell: (p) => p.no_hp },
    { header: 'Asal Sekolah', cell: (p) => p.asal_sekolah ?? '-' },
    { header: 'Tanggal', cell: (p) => new Date(p.dibuat_pada).toLocaleDateString('id-ID') },
    { header: 'Status', cell: (p) => <Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge> },
    {
      header: 'Aksi',
      cell: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.status !== 'dihubungi' && (
            <Button size="sm" variant="secondary" onClick={() => statusMutation.mutate({ id: p.id, status: 'dihubungi' })}>
              Dihubungi
            </Button>
          )}
          {p.status !== 'diterima' && (
            <Button size="sm" onClick={() => statusMutation.mutate({ id: p.id, status: 'diterima' })}>
              Terima
            </Button>
          )}
          {p.status !== 'ditolak' && (
            <Button size="sm" variant="danger" onClick={() => statusMutation.mutate({ id: p.id, status: 'ditolak' })}>
              Tolak
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Pendaftaran PSB" description="Pengajuan calon santri dari formulir publik di landing page." />
      <Card>
        <CardBody>
          {pendaftaranQuery.isError ? (
            <ErrorNotice
              message={pendaftaranQuery.error instanceof ApiError ? pendaftaranQuery.error.message : 'Gagal memuat pendaftaran.'}
            />
          ) : pendaftaranQuery.isLoading ? (
            <Spinner />
          ) : (
            <DataTable columns={columns} rows={pendaftaranQuery.data ?? []} rowKey={(p) => p.id} emptyMessage="Belum ada pendaftaran." />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
