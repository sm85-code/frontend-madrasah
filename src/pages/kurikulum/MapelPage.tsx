import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createMapel, createMateri, deleteMapel, deleteMateri, listMapel } from '../../api/kurikulum'
import { ApiError } from '../../lib/apiClient'
import { Badge } from '../../components/ui/AppBadge'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/AppCard'
import { DeleteRowButton } from '../../components/ui/DeleteRowButton'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { Input, Label } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import { KURIKULUM_WRITE_ROLES } from '../../config/roles'
import { useCanWrite } from '../../hooks/useCanWrite'

export function MapelPage() {
  const queryClient = useQueryClient()
  const writable = useCanWrite(KURIKULUM_WRITE_ROLES)
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

      {writable && (
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
            {createMapelMutation.isError && (
              <div className="w-full">
                <ErrorNotice
                  message={createMapelMutation.error instanceof ApiError ? createMapelMutation.error.message : 'Gagal menambah mapel.'}
                />
              </div>
            )}
          </form>
        </CardBody>
      </Card>
      )}

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
                {writable && <DeleteRowButton onClick={() => deleteMapelMutation.mutate(mapel.id)} label={`Hapus ${mapel.nama}`} />}
              </CardHeader>
              <CardBody>
                <ul className="mb-3 divide-y divide-border text-sm">
                  {mapel.materi.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-2 py-1.5">
                      <span className="text-foreground">{m.judul}</span>
                      {writable && <DeleteRowButton onClick={() => deleteMateriMutation.mutate(m.id)} label={`Hapus ${m.judul}`} />}
                    </li>
                  ))}
                  {mapel.materi.length === 0 && <li className="py-1.5 text-muted-foreground">Belum ada materi.</li>}
                </ul>
                {writable && (
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
                )}
                {createMateriMutation.isError && createMateriMutation.variables === mapel.id && (
                  <div className="mt-2">
                    <ErrorNotice
                      message={createMateriMutation.error instanceof ApiError ? createMateriMutation.error.message : 'Gagal menambah materi.'}
                    />
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
