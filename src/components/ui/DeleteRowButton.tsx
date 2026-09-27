import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from './AppButton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'

/** Icon-only delete action for a table row -- the compact, low-noise
 * treatment shadcn admin tables use for row actions, instead of a full
 * "Hapus" text button repeated on every row.
 *
 * Confirms before firing: `onClick` deletes permanently (no undo, no
 * trash bin) so a bare click on a busy touch screen used to be one
 * accidental tap away from losing a santri/guru/rombel record. */
export function DeleteRowButton({
  onClick,
  pending,
  label = 'Hapus',
  itemName,
}: {
  onClick: () => void
  pending?: boolean
  label?: string
  itemName?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          aria-label={label}
          title={label}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" strokeWidth={2} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus {itemName ?? 'data ini'}?</DialogTitle>
          <DialogDescription>Tindakan ini tidak bisa dibatalkan. Data akan dihapus permanen.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onClick()
              setOpen(false)
            }}
          >
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
