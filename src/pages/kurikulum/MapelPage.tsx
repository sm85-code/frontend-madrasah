import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createMapel, createMateri, deleteMapel, deleteMateri, listMapel } from '../../api/kurikulum'
import { Badge } from '../../components/ui/AppBadge'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/AppCard'
import { Spinner } from '../../components/ui/Feedback'
import { Input, Label } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'

export function MapelPage() {
  const queryClient = useQueryClient()
  const mapelQuery = useQuery({ queryKey: ['kurikulum', 'mapel'], queryFn: listMapel })

  const [kode, setKode] = useState('')
  const [nama, setNama] = useState('')
  const [materiInput, setMateriInput] = useState<Record<string, string>>({})

  const createMapelMutation = useMutation({
    mutationFn: () => createMapel({ kode, nama }),
    onSuccess: () => {
      setKode('')
      setNama('')
      queryClient.invalidateQueries({ queryKey: ['kurikulum', 'mapel'] })
    },
  })

  const deleteMapelMutation = useMutation({
    mutationFn: deleteMapel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kurikulum', 'mapel'] }),
  })

  const createMateriMutation = useMutation({
    mutationFn: (mapelId: string) => createMateri({ mapel_id: mapelId, judul: materiInput[mapelId] ?? '' }),
    onSuccess: (_data, mapelId) => {
      setMateriInput((prev) => ({ ...prev, [mapelId]: '' }))
      queryClient.invalidateQueries({ queryKey: ['kurikulum', 'mapel'] })
    },
  })

  const deleteMateriMutation = useMutation({
    mutationFn: deleteMateri,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kurikulum', 'mapel'] }),
  })

  return (
    <div>
      <PageHeader title="Mapel & Materi" description="Kurikulum: mata pelajaran dan target materi per mapel." />

      <Card className="mb-5">
        <CardBody>
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              createMapelMutation.mutate()
            }}
          >
            <div className="w-32">
              <Label htmlFor="kode-mapel">Kode</Label>
              <Input id="kode-mapel" value={kode} onChange={(e) => setKode(e.target.value)} required />
            </div>
            <div className="flex-1">
              <Label htmlFor="nama-mapel">Nama mapel</Label>
              <Input id="nama-mapel" value={nama} onChange={(e) => setNama(e.target.value)} required />
            </div>
            <Button type="submit" loading={createMapelMutation.isPending}>
              Tambah Mapel
            </Button>
          </form>
        </CardBody>
      </Card>

      {mapelQuery.isLoading ? (
        <Spinner />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {mapelQuery.data?.map((mapel) => (
            <Card key={mapel.id}>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>
                  {mapel.nama} <Badge className="ml-1">{mapel.kode}</Badge>
                </CardTitle>
                <Button size="sm" variant="danger" onClick={() => deleteMapelMutation.mutate(mapel.id)}>
                  Hapus
                </Button>
              </CardHeader>
              <CardBody>
                <ul className="mb-3 space-y-1 text-sm">
                  {mapel.materi.map((m) => (
                    <li key={m.id} className="flex items-center justify-between">
                      <span className="text-slate-700">{m.judul}</span>
                      <Button size="sm" variant="ghost" onClick={() => deleteMateriMutation.mutate(m.id)}>
                        Hapus
                      </Button>
                    </li>
                  ))}
                  {mapel.materi.length === 0 && <li className="text-slate-400">Belum ada materi.</li>}
                </ul>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    createMateriMutation.mutate(mapel.id)
                  }}
                >
                  <Input
                    placeholder="Judul materi baru"
                    value={materiInput[mapel.id] ?? ''}
                    onChange={(e) => setMateriInput((prev) => ({ ...prev, [mapel.id]: e.target.value }))}
                  />
                  <Button type="submit" size="sm" variant="secondary">
                    Tambah
                  </Button>
                </form>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
