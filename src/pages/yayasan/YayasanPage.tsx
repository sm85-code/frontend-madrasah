import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { listAkun } from '../../api/admin'
import { createUnit, deleteUnit, getRekapYayasan, listUnit, patchUnit } from '../../api/yayasan'
import { ApiError } from '../../lib/apiClient'
import { Badge } from '../../components/ui/AppBadge'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { DeleteRowButton } from '../../components/ui/DeleteRowButton'
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
import { FieldError, Input, Label, Select } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuthStore } from '../../store/authStore'
import { YAYASAN_ROLES } from '../../config/roles'
import type { MadrasahUnit, RekapUnit, User } from '../../types'

function useKepalaMadrasahOptions(enabled: boolean) {
  const query = useQuery({ queryKey: ['admin', 'akun'], queryFn: listAkun, enabled })
  const users = (query.data ?? []).filter((u) => u.role === 'kepala_sekolah')
  return { users, isLoading: query.isLoading }
}

const editUnitSchema = z.object({
  nama: z.string().min(1, 'Wajib diisi'),
  alamat: z.string(),
  kepala_user_id: z.string(),
})
type EditUnitValues = z.infer<typeof editUnitSchema>

function EditUnitAction({ unit, kepalaUsers }: { unit: MadrasahUnit; kepalaUsers: User[] }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const currentId = kepalaUsers.find((u) => u.nama === unit.kepala_unit)?.id ?? ''
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditUnitValues>({
    resolver: zodResolver(editUnitSchema),
    defaultValues: { nama: unit.nama, alamat: unit.alamat, kepala_user_id: currentId },
  })

  useEffect(() => {
    if (open) reset({ nama: unit.nama, alamat: unit.alamat, kepala_user_id: currentId })
  }, [open, unit, reset, currentId])

  const mutation = useMutation({
    mutationFn: (values: EditUnitValues) =>
      patchUnit(unit.id, { nama: values.nama, alamat: values.alamat, kepala_user_id: values.kepala_user_id || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['yayasan'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'guru'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'akun'] })
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
            <Select
              id={`edit-kepala-unit-${unit.id}`}
              value={watch('kepala_user_id')}
              onChange={(e) => setValue('kepala_user_id', e.target.value, { shouldValidate: true })}
            >
              <option value="">Belum ditugaskan</option>
              {kepalaUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama}
                </option>
              ))}
            </Select>
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
  const canManageUnit = user ? YAYASAN_ROLES.includes(user.role) : false
  const canDeleteUnit = user?.role === 'admin'
  const { users: kepalaUsers } = useKepalaMadrasahOptions(canManageUnit)

  const rekapQuery = useQuery({ queryKey: ['yayasan', 'rekap'], queryFn: getRekapYayasan })
  const unitQuery = useQuery({ queryKey: ['yayasan', 'unit'], queryFn: listUnit, enabled: canManageUnit })

  const [nama, setNama] = useState('')
  const [alamat, setAlamat] = useState('')
  const [kepalaUserId, setKepalaUserId] = useState('')

  const createMutation = useMutation({
    mutationFn: () => createUnit({ nama, alamat, kepala_user_id: kepalaUserId || undefined }),
    onSuccess: () => {
      setNama('')
      setAlamat('')
      setKepalaUserId('')
      queryClient.invalidateQueries({ queryKey: ['yayasan'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'guru'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'akun'] })
    },
  })

  const toggleAktifMutation = useMutation({
    mutationFn: ({ id, aktif }: { id: string; aktif: boolean }) => patchUnit(id, { aktif }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['yayasan'] }),
  })

  const deleteUnitMutation = useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['yayasan'] }),
  })

  const rekapColumns: Column<RekapUnit>[] = [
    { header: 'Unit', cell: (r) => r.unit_nama },
    { header: 'Status', cell: (r) => <Badge tone={r.aktif ? 'success' : 'neutral'}>{r.aktif ? 'Aktif' : 'Nonaktif'}</Badge> },
    { header: 'Santri', cell: (r) => r.total_santri },
    { header: 'Rombel', cell: (r) => r.total_rombel },
    { header: 'Staf', cell: (r) => r.total_guru },
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
          {canManageUnit && <EditUnitAction unit={u} kepalaUsers={kepalaUsers} />}
          <Button size="sm" variant="secondary" onClick={() => toggleAktifMutation.mutate({ id: u.id, aktif: !u.aktif })}>
            {u.aktif ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
          {canDeleteUnit && <DeleteRowButton onClick={() => deleteUnitMutation.mutate(u.id)} itemName={u.nama} />}
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
                {canManageUnit ? (
                  <Select id="kepala-unit" value={kepalaUserId} onChange={(e) => setKepalaUserId(e.target.value)}>
                    <option value="">Belum ditugaskan</option>
                    {kepalaUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nama}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input id="kepala-unit" value={kepalaUserId} onChange={(e) => setKepalaUserId(e.target.value)} />
                )}
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
            {deleteUnitMutation.isError && (
              <div className="mb-4">
                <ErrorNotice
                  message={deleteUnitMutation.error instanceof ApiError ? deleteUnitMutation.error.message : 'Gagal menghapus unit.'}
                />
              </div>
            )}
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
