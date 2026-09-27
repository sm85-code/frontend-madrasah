import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, GraduationCap } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { getPengaturan } from '../api/public'
import { ApiError } from '../lib/apiClient'
import { AppearancePopover } from '../components/AppearancePopover'
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-8">
      <div className="mb-4 flex w-full max-w-3xl items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
          Kembali ke Beranda
        </Link>
        <AppearancePopover />
      </div>
      <div className="grid w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-card shadow-lg md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-primary to-primary/70 p-8 text-primary-foreground md:flex">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15">
            <GraduationCap className="size-6" strokeWidth={2.25} />
          </span>
          <div>
            <h1 className="text-xl font-semibold leading-tight lg:text-2xl">{pengaturan?.nama_sekolah ?? 'Sistem Informasi Madrasah'}</h1>
            <p className="mt-2 text-sm text-primary-foreground/80">{pengaturan?.tagline ?? 'Masuk untuk melanjutkan'}</p>
          </div>
          <p className="text-xs text-primary-foreground/60">Satu portal untuk seluruh kebutuhan akademik dan administrasi madrasah.</p>
        </div>

        <div className="p-8">
          <div className="mb-6 text-center md:text-left">
            <span className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-accent text-primary md:hidden">
              <GraduationCap className="size-6" strokeWidth={2.25} />
            </span>
            <h2 className="text-lg font-semibold text-foreground">Selamat datang kembali</h2>
            <p className="mt-1 text-sm text-muted-foreground">Masukkan kredensial Anda untuk masuk ke portal.</p>
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
    </div>
  )
}
