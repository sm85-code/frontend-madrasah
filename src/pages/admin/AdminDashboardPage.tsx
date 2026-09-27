import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, CircleDollarSign, GraduationCap, School, Users } from 'lucide-react'
import { getRekap } from '../../api/admin'
import { getRekapYayasan } from '../../api/yayasan'
import { ApiError } from '../../lib/apiClient'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/AppCard'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { hasAnyRole } from '../../config/roles'
import { useAuthStore } from '../../store/authStore'
import { useUnitStore } from '../../store/unitStore'
import type { RekapUmum, RekapUnit } from '../../types'

function UnitStats({
  title,
  total_santri,
  total_guru,
  total_rombel,
  tagihan_lunas,
  tagihan_belum,
  per_rombel,
}: {
  title?: string
  total_santri: number
  total_guru: number
  total_rombel: number
  tagihan_lunas: number
  tagihan_belum: number
  per_rombel?: { rombel: string; jumlah_santri: number }[]
}) {
  return (
    <section className="space-y-4">
      {title && <h2 className="font-heading text-base font-semibold leading-6 text-foreground">{title}</h2>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Santri" value={total_santri} icon={Users} />
        <StatCard label="Total Staf" value={total_guru} icon={GraduationCap} />
        <StatCard label="Total Rombel" value={total_rombel} icon={School} />
        <StatCard label="SPP Lunas" value={tagihan_lunas} tone="success" icon={CheckCircle2} />
        <StatCard label="SPP Belum Lunas" value={tagihan_belum} tone="warning" icon={CircleDollarSign} />
      </div>
      {per_rombel && per_rombel.length > 0 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Santri per Rombel</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="divide-y divide-border">
              {per_rombel.map((r) => (
                <div key={r.rombel} className="flex items-center justify-between py-2.5 text-sm first:pt-0 last:pb-0">
                  <span className="text-foreground">{r.rombel}</span>
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-sm font-medium text-primary">
                    {r.jumlah_santri} santri
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </section>
  )
}

export function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const selectedUnitId = useUnitStore((s) => s.selectedUnitId)
  const lintasUnit = hasAnyRole(user, ['admin', 'yayasan_admin']) && !selectedUnitId

  const unitQuery = useQuery({
    queryKey: ['admin', 'rekap', selectedUnitId],
    queryFn: getRekap,
    enabled: !lintasUnit,
  })
  const yayasanQuery = useQuery({
    queryKey: ['yayasan', 'rekap'],
    queryFn: getRekapYayasan,
    enabled: lintasUnit,
  })

  const isLoading = lintasUnit ? yayasanQuery.isLoading : unitQuery.isLoading
  const isError = lintasUnit ? yayasanQuery.isError : unitQuery.isError
  const error = lintasUnit ? yayasanQuery.error : unitQuery.error
  const unitData: RekapUmum | undefined = unitQuery.data
  const unitList: RekapUnit[] = yayasanQuery.data ?? []

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={
          lintasUnit
            ? 'Ringkasan tiap unit, terpisah.'
            : unitData?.per_unit && unitData.per_unit.length > 1
              ? 'Ringkasan tiap unit tempat Anda ditugaskan.'
              : unitData?.unit_nama
                ? `Ringkasan unit ${unitData.unit_nama}.`
                : unitData && !unitData.unit_id
                  ? 'Akun ini belum terikat unit.'
                  : 'Ringkasan unit Anda.'
        }
      />
      {isError ? (
        <ErrorNotice message={error instanceof ApiError ? error.message : 'Gagal memuat data dashboard.'} />
      ) : isLoading ? (
        <Spinner />
      ) : lintasUnit ? (
        <div className="space-y-8">
          {unitList.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada unit.</p>
          ) : (
            unitList.map((u) => (
              <UnitStats
                key={u.unit_id}
                title={u.aktif ? u.unit_nama : `${u.unit_nama} (nonaktif)`}
                total_santri={u.total_santri}
                total_guru={u.total_guru}
                total_rombel={u.total_rombel}
                tagihan_lunas={u.tagihan_lunas}
                tagihan_belum={u.tagihan_belum}
                per_rombel={u.per_rombel}
              />
            ))
          )}
        </div>
      ) : unitData?.per_unit && unitData.per_unit.length > 0 ? (
        <div className="space-y-8">
          {unitData.per_unit.map((u) => (
            <UnitStats
              key={u.unit_id ?? u.unit_nama ?? 'unit'}
              title={u.unit_nama ?? 'Unit'}
              total_santri={u.total_santri}
              total_guru={u.total_guru}
              total_rombel={u.total_rombel}
              tagihan_lunas={u.tagihan_lunas}
              tagihan_belum={u.tagihan_belum}
              per_rombel={u.per_rombel}
            />
          ))}
        </div>
      ) : unitData ? (
        <UnitStats
          total_santri={unitData.total_santri}
          total_guru={unitData.total_guru}
          total_rombel={unitData.total_rombel}
          tagihan_lunas={unitData.tagihan_lunas}
          tagihan_belum={unitData.tagihan_belum}
          per_rombel={unitData.per_rombel}
        />
      ) : (
        <Spinner />
      )}
    </div>
  )
}
