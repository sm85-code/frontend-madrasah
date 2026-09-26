import { CheckCircle2, XCircle } from 'lucide-react'
import { Alert, AlertDescription } from './alert'
import { Spinner as ShadSpinner } from './spinner'

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <ShadSpinner className="size-6 text-primary" />
    </div>
  )
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <XCircle />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export function SuccessNotice({ message }: { message: string }) {
  return (
    <Alert className="border-success/30 bg-success/5 [&_svg]:text-success">
      <CheckCircle2 />
      <AlertDescription className="text-success">{message}</AlertDescription>
    </Alert>
  )
}
