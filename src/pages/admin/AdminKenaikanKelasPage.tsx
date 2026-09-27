import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { kenaikanKelasMassal, listRombel, listSantriAdmin } from '../../api/admin'
import { ApiError } from '../../lib/apiClient'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { ErrorNotice, SuccessNotice, Spinner } from '../../components/ui/Feedback'
import { Label, Select } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'

const LULUS_VALUE = '__LULUS__'

export function AdminKenaikanKelasPage() {
  const queryClient = useQueryClient()
  const rombelQuery = useQuery({ queryKey: ['admin', 'rombel'], queryFn: listRombel })
  const santriQuery = useQuery({ queryKey: ['admin', 'santri', 'aktif'], queryFn: () => listSantriAdmin('aktif') })

  const [rombelAsalId, setRombelAsalId] = useState('')
  const [pilihan, setPilihan] = useState<Record<string, string>>({})

  const santriDiRombel = useMemo(
    () => (santriQuery.data ?? []).filter((s) => s.rombel_id === rombelAsalId),
    [santriQuery.data, rombelAsalId],
  )

  const mutation = useMutation({
    mutationFn: () =>
      kenaikanKelasMassal(
        santriDiRombel.map((s) => ({
          santri_id: s.id,
          rombel_tujuan_id: pilihan[s.id] && pilihan[s.id] !== LULUS_VALUE ? pilihan[s.id] : null,
        })),
      ),
    onSuccess: () => {
      setPilihan({})
      queryClient.invalidateQueries({ queryKey: ['admin', 'santri'] })
    },
  })

  return (
    <div>
      <PageHeader title="Kenaikan Kelas" description="Pindahkan atau luluskan santri satu rombel sekaligus." />

      <Card className="mb-5">
        <CardBody>
          <Label htmlFor="rombel-asal">Rombel asal</Label>
          <Select id="rombel-asal" className="max-w-xs" value={rombelAsalId} onChange={(e) => setRombelAsalId(e.target.value)}>
            <option value="">Pilih rombel</option>
            {rombelQuery.data?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nama}
              </option>
            ))}
          </Select>
        </CardBody>
      </Card>

      {mutation.isSuccess && (
        <div className="mb-4">
          <SuccessNotice
            message={`Berhasil: ${mutation.data.dipindah.length} santri dipindah, ${mutation.data.diluluskan.length} diluluskan.`}
          />
        </div>
      )}
      {mutation.isError && (
        <div className="mb-4">
          <ErrorNotice message={mutation.error instanceof ApiError ? mutation.error.message : 'Gagal memproses kenaikan kelas.'} />
        </div>
      )}

      {rombelAsalId && (
        <Card>
          <CardBody>
            {santriQuery.isLoading ? (
              <Spinner />
            ) : santriDiRombel.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada santri aktif di rombel ini.</p>
            ) : (
              <>
                <div className="space-y-2">
                  {santriDiRombel.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0">
                      <span className="text-sm text-foreground">{s.nama}</span>
                      <Select
                        className="w-56"
                        value={pilihan[s.id] ?? ''}
                        onChange={(e) => setPilihan((prev) => ({ ...prev, [s.id]: e.target.value }))}
                      >
                        <option value="">Tetap di rombel ini</option>
                        <option value={LULUS_VALUE}>Luluskan</option>
                        {rombelQuery.data
                          ?.filter((r) => r.id !== rombelAsalId)
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              Pindah ke {r.nama}
                            </option>
                          ))}
                      </Select>
                    </div>
                  ))}
                </div>
                <Button className="mt-4" loading={mutation.isPending} onClick={() => mutation.mutate()}>
                  Proses Kenaikan Kelas
                </Button>
              </>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
