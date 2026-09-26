import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { listGuru, listRombel } from '../../api/admin'
import { createGuruMapel, deleteGuruMapel, listGuruMapel, listMapel } from '../../api/kurikulum'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { DeleteRowButton } from '../../components/ui/DeleteRowButton'
import { Spinner } from '../../components/ui/Feedback'
import { Label, Select } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Penugasan } from '../../types'

export function PenugasanPage() {
  const queryClient = useQueryClient()
  const guruQuery = useQuery({ queryKey: ['admin', 'guru'], queryFn: listGuru })
  const mapelQuery = useQuery({ queryKey: ['kurikulum', 'mapel'], queryFn: listMapel })
  const rombelQuery = useQuery({ queryKey: ['admin', 'rombel'], queryFn: listRombel })
  const penugasanQuery = useQuery({ queryKey: ['kurikulum', 'guru-mapel'], queryFn: () => listGuruMapel() })

  const [guruId, setGuruId] = useState('')
  const [mapelId, setMapelId] = useState('')
  const [rombelId, setRombelId] = useState('')

  const createMutation = useMutation({
    mutationFn: () => createGuruMapel({ guru_id: guruId, mapel_id: mapelId, rombel_id: rombelId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kurikulum', 'guru-mapel'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteGuruMapel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kurikulum', 'guru-mapel'] }),
  })

  const columns: Column<Penugasan>[] = [
    { header: 'Guru', cell: (p) => p.guru ?? '-' },
    { header: 'Mapel', cell: (p) => p.mapel ?? '-' },
    { header: 'Rombel', cell: (p) => p.rombel ?? '-' },
    {
      header: '',
      className: 'w-10 text-right',
      cell: (p) => <DeleteRowButton onClick={() => deleteMutation.mutate(p.id)} />,
    },
  ]

  return (
    <div>
      <PageHeader title="Penugasan Guru Mapel" description="Guru mana mengajar mapel apa di rombel mana." />

      <Card className="mb-5">
        <CardBody>
          <form
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault()
              createMutation.mutate()
            }}
          >
            <div>
              <Label htmlFor="guru-penugasan">Guru</Label>
              <Select id="guru-penugasan" value={guruId} onChange={(e) => setGuruId(e.target.value)} required>
                <option value="">Pilih guru</option>
                {guruQuery.data?.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="mapel-penugasan">Mapel</Label>
              <Select id="mapel-penugasan" value={mapelId} onChange={(e) => setMapelId(e.target.value)} required>
                <option value="">Pilih mapel</option>
                {mapelQuery.data?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="rombel-penugasan">Rombel</Label>
              <Select id="rombel-penugasan" value={rombelId} onChange={(e) => setRombelId(e.target.value)} required>
                <option value="">Pilih rombel</option>
                {rombelQuery.data?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" loading={createMutation.isPending} className="self-end">
              Tugaskan
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          {penugasanQuery.isLoading ? <Spinner /> : <DataTable columns={columns} rows={penugasanQuery.data ?? []} rowKey={(p) => p.id} />}
        </CardBody>
      </Card>
    </div>
  )
}
