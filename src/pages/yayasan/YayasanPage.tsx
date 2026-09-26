import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createUnit, getRekapYayasan, listUnit, patchUnit } from '../../api/yayasan'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Spinner } from '../../components/ui/Feedback'
import { Input, Label } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuthStore } from '../../store/authStore'
import { ADMIN_ROLES } from '../../config/roles'
import type { MadrasahUnit, RekapUnit } from '../../types'

export function YayasanPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const canManageUnit = user ? ADMIN_ROLES.includes(user.role) : false

  const rekapQuery = useQuery({ queryKey: ['yayasan', 'rekap'], queryFn: getRekapYayasan })
  const unitQuery = useQuery({ queryKey: ['yayasan', 'unit'], queryFn: listUnit, enabled: canManageUnit })

  const [nama, setNama] = useState('')
  const [alamat, setAlamat] = useState('')
  const [kepalaUnit, setKepalaUnit] = useState('')

  const createMutation = useMutation({
    mutationFn: () => createUnit({ nama, alamat, kepala_unit: kepalaUnit }),
    onSuccess: () => {
      setNama('')
      setAlamat('')
      setKepalaUnit('')
      queryClient.invalidateQueries({ queryKey: ['yayasan'] })
    },
  })

  const toggleAktifMutation = useMutation({
    mutationFn: ({ id, aktif }: { id: string; aktif: boolean }) => patchUnit(id, { aktif }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['yayasan'] }),
  })

  const rekapColumns: Column<RekapUnit>[] = [
    { header: 'Unit', cell: (r) => r.unit_nama },
    { header: 'Status', cell: (r) => <Badge tone={r.aktif ? 'success' : 'neutral'}>{r.aktif ? 'Aktif' : 'Nonaktif'}</Badge> },
    { header: 'Santri', cell: (r) => r.total_santri },
    { header: 'Rombel', cell: (r) => r.total_rombel },
    { header: 'Guru', cell: (r) => r.total_guru },
    { header: 'SPP Lunas', cell: (r) => r.tagihan_lunas },
    { header: 'SPP Belum', cell: (r) => r.tagihan_belum },
  ]

  const unitColumns: Column<MadrasahUnit>[] = [
    { header: 'Nama', cell: (u) => u.nama },
    { header: 'Kepala Unit', cell: (u) => u.kepala_unit || '-' },
    { header: 'Alamat', cell: (u) => u.alamat || '-' },
    { header: 'Status', cell: (u) => <Badge tone={u.aktif ? 'success' : 'neutral'}>{u.aktif ? 'Aktif' : 'Nonaktif'}</Badge> },
    {
      header: 'Aksi',
      cell: (u) => (
        <Button size="sm" variant="secondary" onClick={() => toggleAktifMutation.mutate({ id: u.id, aktif: !u.aktif })}>
          {u.aktif ? 'Nonaktifkan' : 'Aktifkan'}
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Yayasan & Unit" description="Rekap lintas madrasah/unit di bawah yayasan." />

      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Rekap per Unit</CardTitle>
        </CardHeader>
        <CardBody>
          {rekapQuery.isLoading ? <Spinner /> : <DataTable columns={rekapColumns} rows={rekapQuery.data ?? []} rowKey={(r) => r.unit_id} />}
        </CardBody>
      </Card>

      {canManageUnit && (
        <Card>
          <CardHeader>
            <CardTitle>Kelola Unit</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="mb-4 grid gap-3 sm:grid-cols-3"
              onSubmit={(e) => {
                e.preventDefault()
                createMutation.mutate()
              }}
            >
              <div>
                <Label htmlFor="nama-unit">Nama unit</Label>
                <Input id="nama-unit" value={nama} onChange={(e) => setNama(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="kepala-unit">Kepala unit</Label>
                <Input id="kepala-unit" value={kepalaUnit} onChange={(e) => setKepalaUnit(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="alamat-unit">Alamat</Label>
                <Input id="alamat-unit" value={alamat} onChange={(e) => setAlamat(e.target.value)} />
              </div>
              <Button type="submit" loading={createMutation.isPending} className="sm:col-span-3 sm:w-fit">
                Tambah Unit
              </Button>
            </form>
            {unitQuery.isLoading ? <Spinner /> : <DataTable columns={unitColumns} rows={unitQuery.data ?? []} rowKey={(u) => u.id} />}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
