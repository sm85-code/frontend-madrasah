import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { listRombelScoped, listSantriScoped } from '../../api/shared'
import { submitAbsensi } from '../../api/waliKelas'
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

export function WaliKelasAbsensiPage() {
  const rombelQuery = useQuery({ queryKey: ['scoped', 'rombel'], queryFn: listRombelScoped })
  const [rombelId, setRombelId] = useState('')
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10))
  const [statusMap, setStatusMap] = useState<Record<string, string>>({})

  const santriQuery = useQuery({
    queryKey: ['scoped', 'santri', rombelId],
    queryFn: () => listSantriScoped(rombelId),
    enabled: !!rombelId,
  })

  const mutation = useMutation({
    mutationFn: () =>
      submitAbsensi({
        tanggal,
        items: (santriQuery.data ?? []).map((s) => ({
          santri_id: s.id,
          status: (statusMap[s.id] ?? 'hadir') as 'hadir' | 'sakit' | 'izin' | 'alpa',
        })),
      }),
  })

  return (
    <div>
      <PageHeader title="Absensi Harian" description="Catat kehadiran santri per rombel." />

      <Card className="mb-5">
        <CardBody>
          <div className="flex flex-wrap gap-4">
            <div className="w-56">
              <Label htmlFor="rombel-absen">Rombel</Label>
              <Select id="rombel-absen" value={rombelId} onChange={(e) => setRombelId(e.target.value)}>
                <option value="">Pilih rombel</option>
                {rombelQuery.data?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-44">
              <Label htmlFor="tanggal-absen">Tanggal</Label>
              <input
                id="tanggal-absen"
                type="date"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
              />
            </div>
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

      {rombelId && (
        <Card>
          <CardBody>
            {santriQuery.isLoading ? (
              <Spinner />
            ) : (
              <>
                <div className="space-y-2">
                  {santriQuery.data?.map((s) => (
                    <div key={s.id} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                      <span className="text-sm text-foreground">{s.nama}</span>
                      <div className="flex gap-1">
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
