import { Spinner } from './spinner'
import { Button as ShadButton } from './button'
import type { ButtonHTMLAttributes } from 'react'

/** Facade over shadcn/ui's real Button (radix-ui Slot + CVA variants,
 * src/components/ui/button.tsx) that keeps the app's original variant
 * names so the ~25 pages using <Button variant="primary"|"secondary"|
 * "danger"|"ghost"> didn't need a mechanical rewrite -- the rendered
 * output IS the shadcn primitive, this only translates the variant prop. */
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

const variantMap: Record<Variant, 'default' | 'outline' | 'destructive' | 'ghost'> = {
  primary: 'default',
  secondary: 'outline',
  danger: 'destructive',
  ghost: 'ghost',
}

const sizeMap: Record<Size, 'sm' | 'default'> = {
  sm: 'sm',
  md: 'default',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <ShadButton
      variant={variantMap[variant]}
      size={sizeMap[size]}
      className={className}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner className="size-3.5" />}
      {children}
    </ShadButton>
  )
}
