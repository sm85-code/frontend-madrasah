import { useQuery } from '@tanstack/react-query'
import { getAuditLog } from '../../api/admin'
import { ApiError } from '../../lib/apiClient'
import { Card, CardBody } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { PageHeader } from '../../components/ui/PageHeader'
import type { AuditLogEntry } from '../../types'

export function AdminAuditLogPage() {
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['admin', 'audit-log'], queryFn: () => getAuditLog(200) })

  const columns: Column<AuditLogEntry>[] = [
    { header: 'Waktu', cell: (r) => new Date(r.waktu).toLocaleString('id-ID') },
    { header: 'Aktor', cell: (r) => `${r.aktor_nama} (${r.aktor_role})` },
    { header: 'Aksi', cell: (r) => r.aksi },
    { header: 'Entitas', cell: (r) => r.entitas },
    { header: 'Keterangan', cell: (r) => r.keterangan, className: 'max-w-sm truncate' },
    { header: 'IP', cell: (r) => r.ip },
  ]

  return (
    <div>
      <PageHeader title="Audit Log" description="Jejak aksi sensitif: login, reset, keuangan, hapus akun/data." />
      <Card>
        <CardBody>
          {isError ? (
            <ErrorNotice message={error instanceof ApiError ? error.message : 'Gagal memuat audit log.'} />
          ) : isLoading ? (
            <Spinner />
          ) : (
            <DataTable columns={columns} rows={data ?? []} rowKey={(r) => r.id} />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
