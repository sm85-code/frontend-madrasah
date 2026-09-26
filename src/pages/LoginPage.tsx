import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { getPengaturan } from '../api/public'
import { ApiError } from '../lib/apiClient'
import { Button } from '../components/ui/AppButton'
import { ErrorNotice } from '../components/ui/Feedback'
import { FieldError, Input, Label } from '../components/ui/AppInput'
import { firstAccessiblePath } from '../config/nav'
import { loginSchema, type LoginFormValues } from '../schemas/auth'
import { useAuthStore } from '../store/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const { data: pengaturan } = useQuery({ queryKey: ['pengaturan'], queryFn: getPengaturan })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const mutation = useMutation({
    mutationFn: (values: LoginFormValues) => login(values.no_hp, values.password),
    onSuccess: (loggedInUser) => {
      setUser(loggedInUser)
      navigate(firstAccessiblePath(loggedInUser.role), { replace: true })
    },
  })

  if (user) return <Navigate to="/portal" replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold text-foreground">{pengaturan?.nama_sekolah ?? 'Sistem Informasi Madrasah'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{pengaturan?.tagline ?? 'Masuk untuk melanjutkan'}</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
        >
          <div>
            <Label htmlFor="no_hp">Username</Label>
            <Input id="no_hp" placeholder="admin" autoComplete="username" {...register('no_hp')} />
            <FieldError message={errors.no_hp?.message} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
            <FieldError message={errors.password?.message} />
          </div>

          {mutation.isError && (
            <ErrorNotice
              message={mutation.error instanceof ApiError ? mutation.error.message : 'Gagal masuk, coba lagi.'}
            />
          )}

          <Button type="submit" className="w-full" loading={mutation.isPending}>
            Masuk
          </Button>
        </form>
      </div>
    </div>
  )
}
