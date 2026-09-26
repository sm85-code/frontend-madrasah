import type { ReactNode } from 'react'
import { Card } from './Card'

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: string
  tone?: 'default' | 'success' | 'warning' | 'danger'
}

const toneClass: Record<Required<StatCardProps>['tone'], string> = {
  default: 'text-slate-900',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
}

export function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
  return (
    <Card className="px-5 py-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </Card>
  )
}
