/** Facade over shadcn/ui's real form primitives (input.tsx, label.tsx,
 * textarea.tsx) plus the Select adapter (select-adapter.tsx, which wraps
 * shadcn's real Radix select.tsx). Re-exported under the app's original
 * names so existing pages didn't need a rewrite. */
export { Input } from './input'
export { Label } from './label'
export { Textarea } from './textarea'
export { Select } from './select-adapter'

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}
