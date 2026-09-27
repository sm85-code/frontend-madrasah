import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { updateProfil } from '../api/auth'
import { ApiError } from '../lib/apiClient'
import { Badge } from '../components/ui/AppBadge'
import { Button } from '../components/ui/AppButton'
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/AppCard'
import { ErrorNotice, SuccessNotice } from '../components/ui/Feedback'
import { FieldError, Input, Label } from '../components/ui/AppInput'
import { PageHeader } from '../components/ui/PageHeader'
import { ROLE_LABEL } from '../config/roles'
import { useAuthStore } from '../store/authStore'

export function ProfilSayaPage() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [nama, setNama] = useState(user?.nama ?? '')
  const namaMutation = useMutation({
    mutationFn: () => updateProfil({ nama }),
    onSuccess: (updated) => setUser(updated),
  })

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const passwordMismatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword

  const passwordMutation = useMutation({
    mutationFn: () => updateProfil({ current_password: currentPassword, new_password: newPassword }),
    onSuccess: (updated) => {
      setUser(updated)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
  })

  if (!user) return null

  return (
    <div>
      <PageHeader title="Profil Saya" description="Kelola nama dan password akun Anda." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Identitas Akun</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-lg font-semibold text-primary">
                {user.nama.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="font-semibold text-foreground">{user.nama}</p>
                <Badge tone="neutral">{ROLE_LABEL[user.role]}</Badge>
              </div>
            </div>

            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                namaMutation.mutate()
              }}
            >
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={user.no_hp} disabled />
                <p className="mt-1 text-xs text-muted-foreground">Username tidak bisa diubah sendiri -- hubungi admin.</p>
              </div>
              <div>
                <Label htmlFor="nama">Nama</Label>
                <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} required />
              </div>

              {namaMutation.isError && (
                <ErrorNotice message={namaMutation.error instanceof ApiError ? namaMutation.error.message : 'Gagal menyimpan nama.'} />
              )}
              {namaMutation.isSuccess && <SuccessNotice message="Nama berhasil diperbarui." />}

              <Button type="submit" loading={namaMutation.isPending}>
                Simpan Nama
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ganti Password</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                if (!passwordMismatch) passwordMutation.mutate()
              }}
            >
              <div>
                <Label htmlFor="current-password">Password saat ini</Label>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="new-password">Password baru</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Ulangi password baru</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <FieldError message={passwordMismatch ? 'Password baru tidak sama.' : undefined} />
              </div>

              {passwordMutation.isError && (
                <ErrorNotice
                  message={passwordMutation.error instanceof ApiError ? passwordMutation.error.message : 'Gagal mengganti password.'}
                />
              )}
              {passwordMutation.isSuccess && <SuccessNotice message="Password berhasil diganti." />}

              <Button type="submit" loading={passwordMutation.isPending} disabled={passwordMismatch}>
                Ganti Password
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
