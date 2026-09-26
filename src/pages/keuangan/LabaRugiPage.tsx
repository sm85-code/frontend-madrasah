import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getLabaRugi } from '../../api/keuangan'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Feedback'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'

const formatRupiah = (value: string) => `Rp ${Number(value).toLocaleString('id-ID')}`

export function LabaRugiPage() {
  const [bulan, setBulan] = useState('')
  const { data, isLoading } = useQuery({ queryKey: ['keuangan', 'laba-rugi', bulan], queryFn: () => getLabaRugi(bulan || undefined) })

  return (
    <div>
      <PageHeader
        title="Laba Rugi"
        description="Ringkasan pendapatan & beban dari jurnal double-entry."
        actions={<Input type="month" value={bulan} onChange={(e) => setBulan(e.target.value)} className="w-auto" />}
      />

      {isLoading || !data ? (
        <Spinner />
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Pendapatan" value={formatRupiah(data.total_pendapatan)} tone="success" />
            <StatCard label="Total Beban" value={formatRupiah(data.total_beban)} tone="danger" />
            <StatCard label="Laba Bersih" value={formatRupiah(data.laba_bersih)} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pendapatan</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-2 text-sm">
                  {data.pendapatan.map((a) => (
                    <div key={a.kode} className="flex justify-between">
                      <span className="text-slate-600">{a.nama}</span>
                      <span className="font-medium text-slate-900">{formatRupiah(a.jumlah)}</span>
                    </div>
                  ))}
                  {data.pendapatan.length === 0 && <p className="text-slate-400">Belum ada.</p>}
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Beban</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-2 text-sm">
                  {data.beban.map((a) => (
                    <div key={a.kode} className="flex justify-between">
                      <span className="text-slate-600">{a.nama}</span>
                      <span className="font-medium text-slate-900">{formatRupiah(a.jumlah)}</span>
                    </div>
                  ))}
                  {data.beban.length === 0 && <p className="text-slate-400">Belum ada.</p>}
                </div>
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
