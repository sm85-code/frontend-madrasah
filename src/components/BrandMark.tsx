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
  const box = size === 'lg' ? 'size-16 rounded-2xl' : size === 'sm' ? 'size-10 rounded-lg' : 'size-11 rounded-xl'
  const icon = size === 'lg' ? 'size-8' : size === 'sm' ? 'size-5' : 'size-5'
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
