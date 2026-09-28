import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, LogIn } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { getPengaturan } from '../api/public'
import { ApiError } from '../lib/apiClient'
import { AppearancePopover } from '../components/AppearancePopover'
import { BrandMark } from '../components/BrandMark'
import { WallpaperLayer } from '../components/WallpaperLayer'
import { Button } from '../components/ui/AppButton'
import { ErrorNotice } from '../components/ui/Feedback'
import { FieldError, Input, Label } from '../components/ui/AppInput'
import { firstAccessiblePath } from '../config/nav'
import { loginSchema, type LoginFormValues } from '../schemas/auth'
import { useAuthStore } from '../store/authStore'
import { useUnitStore } from '../store/unitStore'

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
      if (loggedInUser.role !== 'admin' && loggedInUser.role !== 'yayasan_admin') {
        useUnitStore.getState().setSelectedUnitId(loggedInUser.madrasah_unit_id ?? loggedInUser.tugas?.[0]?.madrasah_unit_id ?? null)
      }
      navigate(firstAccessiblePath(loggedInUser.role, loggedInUser.roles), { replace: true })
    },
  })

  if (user) return <Navigate to="/portal" replace />

  const brandName = pengaturan?.nama_sekolah ?? 'Sistem Informasi Madrasah'

  return (
    <div className="auth-bg relative flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <WallpaperLayer />
      <div className="relative z-[1] mb-4 flex w-full max-w-md items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--legacy-border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-muted-foreground shadow-soft transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
          Kembali
        </Link>
        <AppearancePopover align="end" />
      </div>

      <div className="fade-in relative z-[1] w-full max-w-md">
        <div className="mb-6 text-center">
          <BrandMark logoUrl={pengaturan?.logo_url} name={brandName} size="lg" className="mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">{brandName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{pengaturan?.tagline ?? 'Masuk untuk melanjutkan'}</p>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--legacy-border)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <h2 className="font-heading text-xl font-semibold">Masuk ke Akun</h2>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">Silakan gunakan username & password Anda.</p>

          <form className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
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

            <Button type="submit" className="w-full gap-2" loading={mutation.isPending}>
              <LogIn className="size-4" strokeWidth={2} />
              Masuk
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {brandName}. Seluruh hak cipta dilindungi.
        </p>
      </div>
    </div>
  )
}
