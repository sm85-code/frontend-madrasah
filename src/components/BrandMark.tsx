import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { LOGO_GLOW_CLASS, resolveLogoUrl } from '../lib/branding'
import { cn } from '../lib/utils'

export function BrandMark({
  logoUrl,
  name,
  size = 'md',
  className,
}: {
  logoUrl?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const [broken, setBroken] = useState(false)
  // Was sm 32 / md 36 / lg 56 → +8px: 40 / 44 / 64
  // Was sm 40 / md 44 / lg 64 → +8px: 48 / 52 / 72
  const box = size === 'lg' ? 'size-[72px] rounded-2xl' : size === 'sm' ? 'size-12 rounded-lg' : 'size-[52px] rounded-xl'
  const icon = size === 'lg' ? 'size-9' : size === 'sm' ? 'size-6' : 'size-6'
  const src = resolveLogoUrl(logoUrl)

  if (!broken) {
    return (
      <img
        src={src}
        alt={name ?? ''}
        className={cn(box, 'shrink-0 object-contain', LOGO_GLOW_CLASS, className)}
        onError={() => setBroken(true)}
      />
    )
  }

  return (
    <span className={cn(box, 'flex shrink-0 items-center justify-center bg-primary text-primary-foreground', className)}>
      <GraduationCap className={icon} strokeWidth={2.25} />
    </span>
  )
}
