import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createAkun, deleteAkun, listAkun, patchAkun } from '../../api/admin'
import { ApiError } from '../../lib/apiClient'
import { Badge } from '../../components/ui/AppBadge'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
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
import { ErrorNotice, Spinner, SuccessNotice } from '../../components/ui/Feedback'
import { FieldError, Input, Label, Select } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import { ROLE_LABEL } from '../../config/roles'
import type { Role, User } from '../../types'

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'admin', label: ROLE_LABEL.admin },
  { value: 'kepala_sekolah', label: ROLE_LABEL.kepala_sekolah },
  { value: 'yayasan_admin', label: ROLE_LABEL.yayasan_admin },
  { value: 'kurikulum', label: ROLE_LABEL.kurikulum },
  { value: 'bendahara', label: ROLE_LABEL.bendahara },
  { value: 'wali_kelas', label: ROLE_LABEL.wali_kelas },
  { value: 'guru', label: ROLE_LABEL.guru },
  { value: 'wali_santri', label: ROLE_LABEL.wali_santri },
]

const ROLE_BADGE_TONE: Record<Role, 'neutral' | 'success' | 'info' | 'warning'> = {
  admin: 'success',
  kepala_sekolah: 'success',
  yayasan_admin: 'info',
  kurikulum: 'warning',
  bendahara: 'warning',
  wali_kelas: 'neutral',
  guru: 'neutral',
  wali_santri: 'neutral',
}

const resetPasswordSchema = z.object({
  password: z.string().min(4, 'Minimal 4 karakter').max(72),
})
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

function ResetPasswordAction({ user }: { user: User }) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) })

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordValues) => patchAkun(user.id, { password: values.password }),
    onSuccess: () => reset(),
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          reset()
          mutation.reset()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" aria-label="Atur password" title="Atur password">
          <KeyRound className="size-4" strokeWidth={2} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atur Password</DialogTitle>
          <DialogDescription>Setel password baru untuk {user.nama}. Pengguna harus login ulang setelahnya.</DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div>
            <Label htmlFor={`new-password-${user.id}`}>Password baru</Label>
            <Input id={`new-password-${user.id}`} type="password" autoComplete="new-password" {...register('password')} />
            <FieldError message={errors.password?.message} />
          </div>
          {mutation.isError && (
            <ErrorNotice message={mutation.error instanceof ApiError ? mutation.error.message : 'Gagal mengubah password.'} />
          )}
          {mutation.isSuccess && <SuccessNotice message="Password berhasil diubah." />}
          <DialogFooter>
            <Button type="submit" loading={mutation.isPending}>
              Simpan Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const editAkunSchema = z.object({
  nama: z.string().min(1, 'Wajib diisi'),
  no_hp: z.string().min(3, 'Minimal 3 karakter'),
  role: z.string().min(1),
})
type EditAkunValues = z.infer<typeof editAkunSchema>

function EditAkunAction({ user }: { user: User }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditAkunValues>({
    resolver: zodResolver(editAkunSchema),
    defaultValues: { nama: user.nama, no_hp: user.no_hp, role: user.role },
  })

  // Form dibuka berkali-kali untuk baris yang sama sepanjang hidup
  // komponen (dialog di-mount sekali, bukan remount per open) -- reset
  // nilainya ke data terbaru user tiap kali dialognya dibuka.
  useEffect(() => {
    if (open) reset({ nama: user.nama, no_hp: user.no_hp, role: user.role })
  }, [open, user, reset])

  const mutation = useMutation({
    mutationFn: (values: EditAkunValues) => patchAkun(user.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'akun'] })
      setOpen(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" aria-label="Edit akun" title="Edit akun">
          <Pencil className="size-4" strokeWidth={2} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Akun</DialogTitle>
          <DialogDescription>Ubah nama, username, atau role untuk {user.nama}.</DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div>
            <Label htmlFor={`edit-nama-${user.id}`}>Nama</Label>
            <Input id={`edit-nama-${user.id}`} {...register('nama')} />
            <FieldError message={errors.nama?.message} />
          </div>
          <div>
            <Label htmlFor={`edit-username-${user.id}`}>Username</Label>
            <Input id={`edit-username-${user.id}`} {...register('no_hp')} />
            <FieldError message={errors.no_hp?.message} />
          </div>
          <div>
            <Label htmlFor={`edit-role-${user.id}`}>Role</Label>
            <Select
              id={`edit-role-${user.id}`}
              value={watch('role')}
              onChange={(e) => setValue('role', e.target.value, { shouldValidate: true })}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
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

export function AdminKelolaAkunPage() {
  const queryClient = useQueryClient()
  const akunQuery = useQuery({ queryKey: ['admin', 'akun'], queryFn: listAkun })

  const [nama, setNama] = useState('')
  const [noHp, setNoHp] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('wali_kelas')
  const [passwordSementara, setPasswordSementara] = useState<{ nama: string; password: string } | null>(null)

  const createMutation = useMutation({
    mutationFn: () => createAkun({ nama, no_hp: noHp, role, password: password || undefined }),
    onSuccess: (created) => {
      setPasswordSementara(created.password_sementara ? { nama: created.nama, password: created.password_sementara } : null)
      setNama('')
      setNoHp('')
      setPassword('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'akun'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAkun,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'akun'] }),
  })

  const columns: Column<User>[] = [
    { header: 'Nama', cell: (u) => u.nama },
    { header: 'Username', cell: (u) => u.no_hp },
    { header: 'Role', cell: (u) => <Badge tone={ROLE_BADGE_TONE[u.role]}>{ROLE_LABEL[u.role]}</Badge> },
    {
      header: '',
      className: 'w-28 text-right',
      cell: (u) => (
        <div className="flex justify-end gap-1">
          <EditAkunAction user={u} />
          <ResetPasswordAction user={u} />
          <DeleteRowButton onClick={() => deleteMutation.mutate(u.id)} itemName={u.nama} />
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Kelola Akun"
        description="Semua akun lintas role -- termasuk admin, kepala madrasah, dan admin yayasan. Khusus admin aplikasi."
      />

      {deleteMutation.isError && (
        <div className="mb-4">
          <ErrorNotice message={deleteMutation.error instanceof ApiError ? deleteMutation.error.message : 'Gagal menghapus akun.'} />
        </div>
      )}

      <Card className="mb-5">
        <CardBody>
          <form
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
            onSubmit={(e) => {
              e.preventDefault()
              createMutation.mutate()
            }}
          >
            <div>
              <Label htmlFor="nama-akun">Nama</Label>
              <Input id="nama-akun" value={nama} onChange={(e) => setNama(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="username-akun">Username</Label>
              <Input id="username-akun" placeholder="username" value={noHp} onChange={(e) => setNoHp(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password-akun">Password</Label>
              <Input
                id="password-akun"
                type="password"
                placeholder="kosongkan untuk dibuatkan acak"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role-akun">Role</Label>
              <Select id="role-akun" value={role} onChange={(e) => setRole(e.target.value as Role)}>
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" loading={createMutation.isPending} className="self-end">
              Tambah Akun
            </Button>
            {createMutation.isError && (
              <div className="sm:col-span-2 lg:col-span-5">
                <ErrorNotice message={createMutation.error instanceof ApiError ? createMutation.error.message : 'Gagal menambah akun.'} />
              </div>
            )}
          </form>
          {passwordSementara && (
            <div className="mt-3">
              <SuccessNotice
                message={`Akun ${passwordSementara.nama} dibuat. Password sementara: ${passwordSementara.password} -- catat sekarang, tidak akan ditampilkan lagi.`}
              />
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          {akunQuery.isLoading ? <Spinner /> : <DataTable columns={columns} rows={akunQuery.data ?? []} rowKey={(u) => u.id} />}
        </CardBody>
      </Card>
    </div>
  )
}
