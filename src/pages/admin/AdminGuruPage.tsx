import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  createGuru,
  createWaliSantri,
  deleteGuru,
  deleteWaliSantri,
  listGuru,
  listWaliSantri,
  patchGuru,
  patchWaliSantri,
} from '../../api/admin'
import { ApiError } from '../../lib/apiClient'
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
import { ErrorNotice, Spinner, SuccessNotice } from '../../components/ui/Feedback'
import { FieldError, Input, Label, Select } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import type { User } from '../../types'

const GURU_ROLE_OPTIONS = [
  { value: 'wali_kelas', label: 'Wali Kelas' },
  { value: 'guru', label: 'Guru Mapel' },
  { value: 'kurikulum', label: 'Kurikulum' },
  { value: 'bendahara', label: 'Bendahara' },
  { value: 'kepala_sekolah', label: 'Kepala Sekolah' },
]

const resetPasswordSchema = z.object({
  password: z.string().min(4, 'Minimal 4 karakter').max(72),
})
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

/** Row action shared by the guru and wali santri tables: opens a small
 * dialog to set a new password for an existing account (backend hashes it
 * and bumps the account's token version, so any JWT already issued for
 * that user stops working -- see services.patch_guru in sm85-arch). */
function ResetPasswordAction({ user, onSubmit }: { user: User; onSubmit: (password: string) => Promise<unknown> }) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) })

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordValues) => onSubmit(values.password),
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

        <form
          className="space-y-3"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
        >
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

export function AdminGuruPage() {
  const queryClient = useQueryClient()
  const guruQuery = useQuery({ queryKey: ['admin', 'guru'], queryFn: listGuru })
  const waliSantriQuery = useQuery({ queryKey: ['admin', 'wali-santri'], queryFn: listWaliSantri })

  const [namaGuru, setNamaGuru] = useState('')
  const [noHpGuru, setNoHpGuru] = useState('')
  const [passwordGuru, setPasswordGuru] = useState('')
  const [roleGuru, setRoleGuru] = useState('wali_kelas')

  const [namaWali, setNamaWali] = useState('')
  const [noHpWali, setNoHpWali] = useState('')
  const [passwordWali, setPasswordWali] = useState('')

  const createGuruMutation = useMutation({
    mutationFn: () =>
      createGuru({ nama: namaGuru, no_hp: noHpGuru, role: roleGuru, password: passwordGuru || undefined }),
    onSuccess: () => {
      setNamaGuru('')
      setNoHpGuru('')
      setPasswordGuru('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'guru'] })
    },
  })

  const deleteGuruMutation = useMutation({
    mutationFn: deleteGuru,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'guru'] }),
  })

  const createWaliMutation = useMutation({
    mutationFn: () => createWaliSantri({ nama: namaWali, no_hp: noHpWali, password: passwordWali || undefined }),
    onSuccess: () => {
      setNamaWali('')
      setNoHpWali('')
      setPasswordWali('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'wali-santri'] })
    },
  })

  const deleteWaliMutation = useMutation({
    mutationFn: deleteWaliSantri,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'wali-santri'] }),
  })

  const guruColumns: Column<User>[] = [
    { header: 'Nama', cell: (u) => u.nama },
    { header: 'Username', cell: (u) => u.no_hp },
    { header: 'Role', cell: (u) => u.role },
    {
      header: '',
      className: 'w-20 text-right',
      cell: (u) => (
        <div className="flex justify-end gap-1">
          <ResetPasswordAction user={u} onSubmit={(password) => patchGuru(u.id, { password })} />
          <DeleteRowButton onClick={() => deleteGuruMutation.mutate(u.id)} />
        </div>
      ),
    },
  ]

  const waliColumns: Column<User>[] = [
    { header: 'Nama', cell: (u) => u.nama },
    { header: 'Username', cell: (u) => u.no_hp },
    {
      header: '',
      className: 'w-20 text-right',
      cell: (u) => (
        <div className="flex justify-end gap-1">
          <ResetPasswordAction user={u} onSubmit={(password) => patchWaliSantri(u.id, { password })} />
          <DeleteRowButton onClick={() => deleteWaliMutation.mutate(u.id)} />
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Guru & Wali Santri" description="Kelola akun staf dan orang tua/wali santri." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Guru / Staf</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="mb-4 flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                createGuruMutation.mutate()
              }}
            >
              <div className="min-w-[140px] flex-1">
                <Label htmlFor="nama-guru">Nama</Label>
                <Input id="nama-guru" value={namaGuru} onChange={(e) => setNamaGuru(e.target.value)} required />
              </div>
              <div className="min-w-[130px]">
                <Label htmlFor="hp-guru">Username</Label>
                <Input id="hp-guru" placeholder="username" value={noHpGuru} onChange={(e) => setNoHpGuru(e.target.value)} required />
              </div>
              <div className="min-w-[130px]">
                <Label htmlFor="password-guru">Password</Label>
                <Input
                  id="password-guru"
                  type="password"
                  placeholder="default: password123"
                  autoComplete="new-password"
                  value={passwordGuru}
                  onChange={(e) => setPasswordGuru(e.target.value)}
                />
              </div>
              <div className="min-w-[150px]">
                <Label htmlFor="role-guru">Role</Label>
                <Select id="role-guru" value={roleGuru} onChange={(e) => setRoleGuru(e.target.value)}>
                  {GURU_ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <Button type="submit" loading={createGuruMutation.isPending}>
                Tambah
              </Button>
            </form>
            {guruQuery.isLoading ? <Spinner /> : <DataTable columns={guruColumns} rows={guruQuery.data ?? []} rowKey={(u) => u.id} />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wali Santri</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="mb-4 flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                createWaliMutation.mutate()
              }}
            >
              <div className="min-w-[140px] flex-1">
                <Label htmlFor="nama-wali">Nama</Label>
                <Input id="nama-wali" value={namaWali} onChange={(e) => setNamaWali(e.target.value)} required />
              </div>
              <div className="min-w-[130px]">
                <Label htmlFor="hp-wali">Username</Label>
                <Input id="hp-wali" placeholder="username" value={noHpWali} onChange={(e) => setNoHpWali(e.target.value)} required />
              </div>
              <div className="min-w-[130px]">
                <Label htmlFor="password-wali">Password</Label>
                <Input
                  id="password-wali"
                  type="password"
                  placeholder="default: password123"
                  autoComplete="new-password"
                  value={passwordWali}
                  onChange={(e) => setPasswordWali(e.target.value)}
                />
              </div>
              <Button type="submit" loading={createWaliMutation.isPending}>
                Tambah
              </Button>
            </form>
            {waliSantriQuery.isLoading ? (
              <Spinner />
            ) : (
              <DataTable columns={waliColumns} rows={waliSantriQuery.data ?? []} rowKey={(u) => u.id} />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
