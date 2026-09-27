import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createSantri, deleteSantri, listRombel, listSantriAdmin, setSantriStatus } from '../../api/admin'
import { ApiError } from '../../lib/apiClient'
import { Badge } from '../../components/ui/AppBadge'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { DeleteRowButton } from '../../components/ui/DeleteRowButton'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { Input, Label, Select } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Santri } from '../../types'
import { canWrite, SANTRI_WRITE_ROLES } from '../../config/roles'
import { useAuthStore } from '../../store/authStore'

const STATUS_TONE: Record<string, 'success' | 'neutral' | 'warning'> = {
  aktif: 'success',
  lulus: 'neutral',
  keluar: 'warning',
  pindah: 'warning',
}

export function AdminSantriPage() {
  const queryClient = useQueryClient()
  const role = useAuthStore((s) => s.user?.role)
  const writable = canWrite(role, SANTRI_WRITE_ROLES)
  const [nama, setNama] = useState('')
  const [rombelId, setRombelId] = useState('')
  const [filterStatus, setFilterStatus] = useState('semua')

  const santriQuery = useQuery({
    queryKey: ['admin', 'santri', filterStatus],
    queryFn: () => listSantriAdmin(filterStatus),
  })
  const rombelQuery = useQuery({ queryKey: ['admin', 'rombel'], queryFn: listRombel })

  const createMutation = useMutation({
    mutationFn: () => createSantri({ nama, rombel_id: rombelId || null }),
    onSuccess: () => {
      setNama('')
      setRombelId('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'santri'] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => setSantriStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'santri'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSantri,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'santri'] }),
  })

  const rombelName = (id: string | null) => rombelQuery.data?.find((r) => r.id === id)?.nama ?? '-'

  const columns: Column<Santri>[] = [
    { header: 'Nama', cell: (s) => s.nama },
    { header: 'Rombel', cell: (s) => rombelName(s.rombel_id) },
    {
      header: 'Status',
      cell: (s) => <Badge tone={STATUS_TONE[s.status ?? 'aktif']}>{s.status ?? 'aktif'}</Badge>,
    },
    {
      header: 'Aksi',
      cell: (s) =>
        writable ? (
        <div className="flex gap-1">
          {s.status !== 'aktif' && (
            <Button size="sm" variant="secondary" onClick={() => statusMutation.mutate({ id: s.id, status: 'aktif' })}>
              Aktifkan
            </Button>
          )}
          {s.status !== 'lulus' && (
            <Button size="sm" variant="secondary" onClick={() => statusMutation.mutate({ id: s.id, status: 'lulus' })}>
              Luluskan
            </Button>
          )}
          {s.status !== 'keluar' && (
            <Button size="sm" variant="danger" onClick={() => statusMutation.mutate({ id: s.id, status: 'keluar' })}>
              Keluarkan
            </Button>
          )}
          <DeleteRowButton
            onClick={() => deleteMutation.mutate(s.id)}
            pending={deleteMutation.isPending}
            itemName={`santri ${s.nama}`}
          />
        </div>
        ) : (
          <span className="text-xs text-muted-foreground">Lihat saja</span>
        ),
    },
  ]

  return (
    <div>
      <PageHeader title="Santri" description="Kelola data santri, penempatan rombel, dan status." />

      {writable && (
      <Card className="mb-5">
        <CardBody>
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              createMutation.mutate()
            }}
          >
            <div className="min-w-[180px] flex-1">
              <Label htmlFor="nama-santri">Nama santri</Label>
              <Input id="nama-santri" value={nama} onChange={(e) => setNama(e.target.value)} required />
            </div>
            <div className="min-w-[180px]">
              <Label htmlFor="rombel-santri">Rombel</Label>
              <Select id="rombel-santri" value={rombelId} onChange={(e) => setRombelId(e.target.value)}>
                <option value="">Belum ditempatkan</option>
                {rombelQuery.data?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" loading={createMutation.isPending}>
              Tambah Santri
            </Button>
          </form>
        </CardBody>
      </Card>
      )}

      <div className="mb-3 flex items-center gap-2">
        <Label htmlFor="filter-status" className="mb-0">
          Filter status
        </Label>
        <Select id="filter-status" className="w-auto" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="semua">Semua</option>
          <option value="aktif">Aktif</option>
          <option value="lulus">Lulus</option>
          <option value="keluar">Keluar</option>
          <option value="pindah">Pindah</option>
        </Select>
      </div>

      <Card>
        <CardBody>
          {deleteMutation.isError && (
            <div className="mb-3">
              <ErrorNotice
                message={deleteMutation.error instanceof ApiError ? deleteMutation.error.message : 'Gagal menghapus santri.'}
              />
            </div>
          )}
          {santriQuery.isLoading ? (
            <Spinner />
          ) : (
            <DataTable columns={columns} rows={santriQuery.data ?? []} rowKey={(s) => s.id} />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
