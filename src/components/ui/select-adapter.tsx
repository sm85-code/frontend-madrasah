import { Children, isValidElement, type OptionHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import {
  Select as ShadSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

/** Adapter that renders shadcn/ui's real Radix Select (select.tsx) behind
 * the app's original native-<select>-shaped API: `<Select value onChange>
 * <option value="x">Label</option>…</Select>`. Every one of this app's ~25
 * dropdown call sites already uses that shape (built before this migration
 * to shadcn/ui), so this adapter avoids rewriting every call site into
 * <SelectTrigger>/<SelectContent>/<SelectItem> by hand while still
 * rendering the genuine Radix-based, accessible dropdown underneath.
 *
 * Radix's Select.Item forbids an empty-string value (it's reserved to mean
 * "no selection"), but this app's placeholder options are always
 * `<option value="">Pilih …</option>` -- mapped to an internal sentinel
 * and translated back to "" in the synthetic onChange event. */
const EMPTY_VALUE_SENTINEL = '__select_empty__'

interface OptionLike {
  value: string
  label: ReactNode
  disabled?: boolean
}

function extractOptions(children: ReactNode): OptionLike[] {
  const options: OptionLike[] = []
  Children.forEach(children, (child) => {
    if (!isValidElement<OptionHTMLAttributes<HTMLOptionElement>>(child)) return
    options.push({
      value: String(child.props.value ?? ''),
      label: child.props.children,
      disabled: child.props.disabled,
    })
  })
  return options
}

interface SelectAdapterProps {
  id?: string
  className?: string
  value: string
  onChange: (event: { target: { value: string } }) => void
  disabled?: boolean
  required?: boolean
  children: ReactNode
}

export function Select({ id, className, value, onChange, disabled, children }: SelectAdapterProps) {
  const options = extractOptions(children)

  return (
    <ShadSelect
      value={value === '' ? EMPTY_VALUE_SENTINEL : value}
      onValueChange={(v) => onChange({ target: { value: v === EMPTY_VALUE_SENTINEL ? '' : v } } as never)}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={cn('w-full', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value || EMPTY_VALUE_SENTINEL} value={opt.value === '' ? EMPTY_VALUE_SENTINEL : opt.value} disabled={opt.disabled}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </ShadSelect>
  )
}
