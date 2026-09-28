import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { resolveLogoUrl } from '../lib/branding'
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
  const box = size === 'lg' ? 'size-14 rounded-2xl' : size === 'sm' ? 'size-8 rounded-lg' : 'size-9 rounded-xl'
  const icon = size === 'lg' ? 'size-7' : size === 'sm' ? 'size-4' : 'size-4.5'
  const src = resolveLogoUrl(logoUrl)

  if (!broken) {
    return (
      <img
        src={src}
        alt={name ?? ''}
        className={cn(box, 'shrink-0 object-contain', className)}
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
