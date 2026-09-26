import type { HTMLAttributes } from 'react'
import { Badge as ShadBadge } from './badge'

/** Facade over shadcn/ui's real Badge (src/components/ui/badge.tsx,
 * extended with success/warning/info variants for this app) -- keeps the
 * original `tone` prop name so existing pages didn't need a rewrite. */
type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

const toneMap: Record<Tone, 'secondary' | 'success' | 'warning' | 'destructive' | 'info'> = {
  neutral: 'secondary',
  success: 'success',
  warning: 'warning',
  danger: 'destructive',
  info: 'info',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  return <ShadBadge variant={toneMap[tone]} className={className} {...rest} />
}
