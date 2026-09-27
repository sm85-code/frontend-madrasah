import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createUnit, getRekapYayasan, listUnit, patchUnit } from '../../api/yayasan'
import { ApiError } from '../../lib/apiClient'
import { Badge } from '../../components/ui/AppBadge'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { FieldError, Input, Label } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuthStore } from '../../store/authStore'
import { ADMIN_ROLES, APP_ADMIN_ROLES } from '../../config/roles'
import type { MadrasahUnit, RekapUnit } from '../../types'

const editUnitSchema = z.object({
  nama: z.string().min(1, 'Wajib diisi'),
  alamat: z.string(),
  kepala_unit: z.string(),
})
type EditUnitValues = z.infer<typeof editUnitSchema>

/** Edit lengkap (nama/alamat/kepala unit) khusus admin utama (APP_ADMIN_ROLES)
 * -- kepala_sekolah belum ditugaskan ke unit tertentu, jadi menugaskan
 * "Kepala Unit" untuk unit lain sengaja tidak diserahkan ke kepala_sekolah,
 * beda dari toggle aktif/nonaktif yang tetap ADMIN_ROLES (lihat backend
 * admin_unit_patch di madrasah_router.py -- endpointnya sendiri masih
 * ADMIN_ROLES, restriksi "admin saja" ini di level UI). */
function EditUnitAction({ unit }: { unit: MadrasahUnit }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUnitValues>({
    resolver: zodResolver(editUnitSchema),
    defaultValues: { nama: unit.nama, alamat: unit.alamat, kepala_unit: unit.kepala_unit },
  })

  useEffect(() => {
    if (open) reset({ nama: unit.nama, alamat: unit.alamat, kepala_unit: unit.kepala_unit })
  }, [open, unit, reset])

  const mutation = useMutation({
    mutationFn: (values: EditUnitValues) => patchUnit(unit.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['yayasan'] })
      setOpen(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" aria-label="Edit unit" title="Edit unit">
          <Pencil className="size-4" strokeWidth={2} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Unit</DialogTitle>
          <DialogDescription>Ubah nama, alamat, atau kepala unit untuk {unit.nama}.</DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div>
            <Label htmlFor={`edit-nama-unit-${unit.id}`}>Nama unit</Label>
            <Input id={`edit-nama-unit-${unit.id}`} {...register('nama')} />
            <FieldError message={errors.nama?.message} />
          </div>
          <div>
            <Label htmlFor={`edit-kepala-unit-${unit.id}`}>Kepala unit</Label>
            <Input id={`edit-kepala-unit-${unit.id}`} {...register('kepala_unit')} />
          </div>
          <div>
            <Label htmlFor={`edit-alamat-unit-${unit.id}`}>Alamat</Label>
            <Input id={`edit-alamat-unit-${unit.id}`} {...register('alamat')} />
          </div>
          {mutation.isError && (
            <ErrorNotice message={mutation.error instanceof ApiError ? mutation.error.message : 'Gagal menyimpan perubahan.'} />
          )}
          <DialogFooter>
            <Button type="submit" loading={mutation.isPending}>
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function YayasanPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const canManageUnit = user ? ADMIN_ROLES.includes(user.role) : false
  const canEditUnit = user ? APP_ADMIN_ROLES.includes(user.role) : false

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
        <div className="flex items-center gap-1">
          {canEditUnit && <EditUnitAction unit={u} />}
          <Button size="sm" variant="secondary" onClick={() => toggleAktifMutation.mutate({ id: u.id, aktif: !u.aktif })}>
            {u.aktif ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
        </div>
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
              {createMutation.isError && (
                <div className="sm:col-span-3">
                  <ErrorNotice message={createMutation.error instanceof ApiError ? createMutation.error.message : 'Gagal menambah unit.'} />
                </div>
              )}
            </form>
            {toggleAktifMutation.isError && (
              <div className="mb-4">
                <ErrorNotice
                  message={toggleAktifMutation.error instanceof ApiError ? toggleAktifMutation.error.message : 'Gagal mengubah status unit.'}
                />
              </div>
            )}
            {unitQuery.isLoading ? <Spinner /> : <DataTable columns={unitColumns} rows={unitQuery.data ?? []} rowKey={(u) => u.id} />}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
