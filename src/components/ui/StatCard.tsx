import type { ReactNode } from 'react'
import { Card, CardContent } from './card'

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: string
  tone?: 'default' | 'success' | 'warning' | 'danger'
}

const toneClass: Record<Required<StatCardProps>['tone'], string> = {
  default: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
}

export function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-semibold ${toneClass[tone]}`}>{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}
