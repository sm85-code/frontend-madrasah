import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { getPenugasanSaya, getSantriRombel, submitAbsensiMapel } from '../../api/guruMapel'
import { ApiError } from '../../lib/apiClient'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { ErrorNotice, Spinner, SuccessNotice } from '../../components/ui/Feedback'
import { Label, Select } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'

const STATUS_OPTIONS = [
  { value: 'hadir', label: 'Hadir' },
  { value: 'sakit', label: 'Sakit' },
  { value: 'izin', label: 'Izin' },
  { value: 'alpa', label: 'Alpa' },
] as const

export function AbsensiMapelPage() {
  const penugasanQuery = useQuery({ queryKey: ['guru-mapel', 'penugasan-saya'], queryFn: getPenugasanSaya })
  const [penugasanId, setPenugasanId] = useState('')
  const [statusMap, setStatusMap] = useState<Record<string, string>>({})

  const penugasan = useMemo(() => penugasanQuery.data?.find((p) => p.id === penugasanId), [penugasanQuery.data, penugasanId])

  const santriQuery = useQuery({
    queryKey: ['guru-mapel', 'santri', penugasan?.rombel_id],
    queryFn: () => getSantriRombel(penugasan!.rombel_id),
    enabled: !!penugasan,
  })

  const mutation = useMutation({
    mutationFn: () =>
      submitAbsensiMapel({
        tanggal: new Date().toISOString().slice(0, 10),
        rombel_id: penugasan!.rombel_id,
        mapel_id: penugasan!.mapel_id,
        items: (santriQuery.data ?? []).map((s) => ({
          santri_id: s.id,
          status: (statusMap[s.id] ?? 'hadir') as 'hadir' | 'sakit' | 'izin' | 'alpa',
        })),
      }),
  })

  return (
    <div>
      <PageHeader title="Absensi Mapel" description="Absensi per sesi mengajar (bukan absensi harian wali kelas)." />

      <Card className="mb-5">
        <CardBody>
          <div className="w-full max-w-sm">
            <Label htmlFor="penugasan-absen">Mapel & Rombel</Label>
            <Select id="penugasan-absen" value={penugasanId} onChange={(e) => setPenugasanId(e.target.value)}>
              <option value="">Pilih penugasan</option>
              {penugasanQuery.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.mapel} - {p.rombel}
                </option>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {mutation.isSuccess && (
        <div className="mb-4">
          <SuccessNotice message={`Absensi tersimpan untuk ${mutation.data.inserted} santri.`} />
        </div>
      )}
      {mutation.isError && (
        <div className="mb-4">
          <ErrorNotice message={mutation.error instanceof ApiError ? mutation.error.message : 'Gagal menyimpan absensi.'} />
        </div>
      )}

      {penugasan && (
        <Card>
          <CardBody>
            {santriQuery.isLoading ? (
              <Spinner />
            ) : (
              <>
                <div className="space-y-2">
                  {santriQuery.data?.map((s) => (
                    <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2 last:border-0">
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{s.nama}</span>
                      <div className="flex shrink-0 flex-wrap gap-1">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setStatusMap((prev) => ({ ...prev, [s.id]: opt.value }))}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                              (statusMap[s.id] ?? 'hadir') === opt.value
                                ? 'bg-primary text-white'
                                : 'bg-muted text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-4" loading={mutation.isPending} onClick={() => mutation.mutate()}>
                  Simpan Absensi
                </Button>
              </>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
