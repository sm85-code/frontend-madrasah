import type { ComponentType, ReactNode } from 'react'
import { Card, CardContent } from './card'
import { cn } from '../../lib/cn'

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: string
  tone?: 'default' | 'success' | 'warning' | 'danger'
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>
}

const toneClass: Record<Required<StatCardProps>['tone'], string> = {
  default: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
}

const toneIconClass: Record<Required<StatCardProps>['tone'], string> = {
  default: 'bg-accent text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-destructive/10 text-destructive',
}

export function StatCard({ label, value, hint, tone = 'default', icon: Icon }: StatCardProps) {
  return (
    <Card className="shadow-soft transition-shadow hover:shadow-md">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className={cn('mt-1 text-2xl font-semibold tabular-nums', toneClass[tone])}>{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', toneIconClass[tone])}>
            <Icon className="size-4.5" strokeWidth={2.25} />
          </span>
        )}
      </CardContent>
    </Card>
  )
}
