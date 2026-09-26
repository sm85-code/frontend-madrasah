import { Trash2 } from 'lucide-react'
import { Button } from './AppButton'

/** Icon-only delete action for a table row -- the compact, low-noise
 * treatment shadcn admin tables use for row actions, instead of a full
 * "Hapus" text button repeated on every row. */
export function DeleteRowButton({ onClick, pending, label = 'Hapus' }: { onClick: () => void; pending?: boolean; label?: string }) {
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onClick}
      disabled={pending}
      aria-label={label}
      title={label}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      <Trash2 className="size-4" strokeWidth={2} />
    </Button>
  )
}
