import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { Label as ShadLabel } from './label'

/** Facade over shadcn/ui's real form primitives (input.tsx, label.tsx,
 * textarea.tsx) plus the Select adapter (select-adapter.tsx, which wraps
 * shadcn's real Radix select.tsx). Re-exported under the app's original
 * names so existing pages didn't need a rewrite. */
export { Input } from './input'
export { Textarea } from './textarea'
export { Select } from './select-adapter'

/** shadcn's raw Label has zero bottom margin -- its own examples always
 * wrap it with an input inside a `space-y-2` container, but every page
 * here just stacks <Label> directly above <Input> with no wrapper, so
 * the label text ended up glued to the input box. Adding the spacing
 * here (instead of in every page's markup) fixes it everywhere the app
 * uses a label-above-field layout, which is the only way Label is used
 * in this app (no inline checkbox/radio labels yet). */
export function Label({ className, ...props }: ComponentProps<typeof ShadLabel>) {
  return <ShadLabel className={cn('mb-1.5 block text-sm font-medium leading-5', className)} {...props} />
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}
