import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { getPenugasanSaya, getRaporSantri, getSantriRombel } from '../../api/guruMapel'
import { Card, CardBody } from '../../components/ui/AppCard'
import { Spinner } from '../../components/ui/Feedback'
import { Label, Select } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'

export function RaporPage() {
  const penugasanQuery = useQuery({ queryKey: ['guru-mapel', 'penugasan-saya'], queryFn: getPenugasanSaya })
  const [penugasanId, setPenugasanId] = useState('')
  const [santriId, setSantriId] = useState('')

  const penugasan = useMemo(() => penugasanQuery.data?.find((p) => p.id === penugasanId), [penugasanQuery.data, penugasanId])

  const santriQuery = useQuery({
    queryKey: ['guru-mapel', 'santri', penugasan?.rombel_id],
    queryFn: () => getSantriRombel(penugasan!.rombel_id),
    enabled: !!penugasan,
  })

  const raporQuery = useQuery({
    queryKey: ['guru-mapel', 'rapor', santriId],
    queryFn: () => getRaporSantri(santriId),
    enabled: !!santriId,
  })

  return (
    <div>
      <PageHeader title="Rapor Santri" description="Riwayat progres/hafalan santri yang Anda ajar." />

      <Card className="mb-5">
        <CardBody>
          <div className="flex flex-wrap gap-4">
            <div className="w-56">
              <Label htmlFor="penugasan-rapor">Mapel & Rombel</Label>
              <Select id="penugasan-rapor" value={penugasanId} onChange={(e) => { setPenugasanId(e.target.value); setSantriId('') }}>
                <option value="">Pilih penugasan</option>
                {penugasanQuery.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.mapel} - {p.rombel}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-56">
              <Label htmlFor="santri-rapor">Santri</Label>
              <Select id="santri-rapor" value={santriId} onChange={(e) => setSantriId(e.target.value)} disabled={!penugasan}>
                <option value="">Pilih santri</option>
                {santriQuery.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {santriId && (
        <Card>
          <CardBody>
            {raporQuery.isLoading ? (
              <Spinner />
            ) : (
              <div className="space-y-2">
                {raporQuery.data?.progres.map((p) => (
                  <div key={p.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <p className="font-medium text-slate-700">
                      {p.tanggal} · {p.tipe}
                    </p>
                    <p className="text-slate-600">{p.capaian}</p>
                    {p.catatan_guru && <p className="mt-0.5 text-xs text-slate-500">{p.catatan_guru}</p>}
                  </div>
                ))}
                {raporQuery.data?.progres.length === 0 && <p className="text-sm text-slate-400">Belum ada progres tercatat.</p>}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
