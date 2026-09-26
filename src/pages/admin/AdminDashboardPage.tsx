import { useQuery } from '@tanstack/react-query'
import { getRekap } from '../../api/admin'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/AppCard'
import { Spinner } from '../../components/ui/Feedback'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'rekap'], queryFn: getRekap })

  return (
    <div>
      <PageHeader title="Dashboard" description="Ringkasan operasional madrasah." />
      {isLoading || !data ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Total Santri" value={data.total_santri} />
            <StatCard label="Total Guru" value={data.total_guru} />
            <StatCard label="Total Rombel" value={data.total_rombel} />
            <StatCard label="SPP Lunas" value={data.tagihan_lunas} tone="success" />
            <StatCard label="SPP Belum Lunas" value={data.tagihan_belum} tone="warning" />
          </div>

          <Card className="mt-5">
            <CardHeader>
              <CardTitle>Santri per Rombel</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {data.per_rombel.map((r) => (
                  <div key={r.rombel} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{r.rombel}</span>
                    <span className="font-medium text-foreground">{r.jumlah_santri} santri</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
