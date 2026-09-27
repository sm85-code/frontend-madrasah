import { useQuery } from '@tanstack/react-query'
import { getPenugasanSaya } from '../../api/guruMapel'
import { ApiError } from '../../lib/apiClient'
import { Card, CardBody } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Penugasan } from '../../types'

export function PenugasanSayaPage() {
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['guru-mapel', 'penugasan-saya'], queryFn: getPenugasanSaya })

  const columns: Column<Penugasan>[] = [
    { header: 'Mapel', cell: (p) => p.mapel ?? '-' },
    { header: 'Rombel', cell: (p) => p.rombel ?? '-' },
  ]

  return (
    <div>
      <PageHeader title="Penugasan Saya" description="Mapel dan rombel yang Anda ajar." />
      <Card>
        <CardBody>
          {isError ? (
            <ErrorNotice message={error instanceof ApiError ? error.message : 'Gagal memuat penugasan.'} />
          ) : isLoading ? (
            <Spinner />
          ) : (
            <DataTable columns={columns} rows={data ?? []} rowKey={(p) => p.id} />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
