import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, CircleDollarSign, GraduationCap, School, Users } from 'lucide-react'
import { getRekap } from '../../api/admin'
import { ApiError } from '../../lib/apiClient'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/AppCard'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'

export function AdminDashboardPage() {
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['admin', 'rekap'], queryFn: getRekap })

  return (
    <div>
      <PageHeader title="Dashboard" description="Ringkasan operasional madrasah." />
      {isError ? (
        <ErrorNotice message={error instanceof ApiError ? error.message : 'Gagal memuat data dashboard.'} />
      ) : isLoading || !data ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Total Santri" value={data.total_santri} icon={Users} />
            <StatCard label="Total Guru" value={data.total_guru} icon={GraduationCap} />
            <StatCard label="Total Rombel" value={data.total_rombel} icon={School} />
            <StatCard label="SPP Lunas" value={data.tagihan_lunas} tone="success" icon={CheckCircle2} />
            <StatCard label="SPP Belum Lunas" value={data.tagihan_belum} tone="warning" icon={CircleDollarSign} />
          </div>

          <Card className="mt-5 shadow-soft">
            <CardHeader>
              <CardTitle>Santri per Rombel</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="divide-y divide-border">
                {data.per_rombel.map((r) => (
                  <div key={r.rombel} className="flex items-center justify-between py-2.5 text-sm first:pt-0 last:pb-0">
                    <span className="text-foreground">{r.rombel}</span>
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-primary">
                      {r.jumlah_santri} santri
                    </span>
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
