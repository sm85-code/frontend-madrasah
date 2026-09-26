import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-semibold text-foreground">404</h1>
      <p className="text-sm text-muted-foreground">Halaman tidak ditemukan.</p>
      <Link to="/" className="mt-2 text-sm font-medium text-primary hover:underline">
        Kembali ke beranda
      </Link>
    </div>
  )
}
