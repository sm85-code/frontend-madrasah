import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/** Last-resort net so one page's bug (a bad API shape, a null dereference)
 * shows a recoverable message instead of a blank white screen for the
 * whole app. Route-level errors should still be handled locally where
 * possible (see LandingPage's defensive Array.isArray guard) -- this is
 * the backstop, not the primary error handling. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
          <h1 className="text-lg font-semibold text-slate-800">Terjadi kesalahan tak terduga</h1>
          <p className="max-w-sm text-sm text-slate-500">
            Silakan muat ulang halaman. Kalau ini terus terjadi, hubungi admin madrasah.
          </p>
          <button
            onClick={() => window.location.assign('/')}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Kembali ke beranda
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
