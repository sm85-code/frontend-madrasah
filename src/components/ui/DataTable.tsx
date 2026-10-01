import { Inbox } from 'lucide-react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'

export interface Column<T> {
  header: string
  // `index` = posisi baris (dari 0) pada urutan yang sedang tampil.
  cell: (row: T, index: number) => ReactNode
  className?: string
  // Jika diisi, header kolom bisa diklik untuk mengurutkan.
  sortValue?: (row: T) => string | number | null | undefined
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  emptyMessage?: string
}

export function DataTable<T>({ columns, rows, rowKey, emptyMessage = 'Belum ada data.' }: DataTableProps<T>) {
  const [sort, setSort] = useState<{ header: string; dir: 'asc' | 'desc' } | null>(null)

  const sortedRows = useMemo(() => {
    const col = sort && columns.find((c) => c.header === sort.header)
    if (!sort || !col?.sortValue) return rows
    const get = col.sortValue
    const factor = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const va = get(a)
      const vb = get(b)
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * factor
      return String(va).localeCompare(String(vb), 'id', { numeric: true, sensitivity: 'base' }) * factor
    })
  }, [rows, columns, sort])

  function toggleSort(header: string) {
    setSort((cur) =>
      cur?.header !== header ? { header, dir: 'asc' } : cur.dir === 'asc' ? { header, dir: 'desc' } : null,
    )
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
        <Inbox className="size-6 text-muted-foreground" strokeWidth={1.75} />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.header} className="text-sm font-medium text-muted-foreground">
                {col.sortValue ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-foreground"
                    onClick={() => toggleSort(col.header)}
                    aria-label={`Urutkan berdasarkan ${col.header}`}
                  >
                    {col.header}
                    {sort?.header !== col.header ? (
                      <ArrowUpDown className="size-3.5 opacity-50" />
                    ) : sort.dir === 'asc' ? (
                      <ArrowUp className="size-3.5" />
                    ) : (
                      <ArrowDown className="size-3.5" />
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.map((row, index) => (
            <TableRow key={rowKey(row)}>
              {columns.map((col) => (
                <TableCell key={col.header} className={col.className}>
                  {col.cell(row, index)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
