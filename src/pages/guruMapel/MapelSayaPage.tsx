import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getMapelSaya, patchMateriSaya } from '../../api/guruMapel'
import { ApiError } from '../../lib/apiClient'
import { Badge } from '../../components/ui/AppBadge'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/AppCard'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { Input } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import type { MateriTarget } from '../../types'

/** Baris satu materi -- klik "Edit" untuk mengubah judulnya lewat
 * PATCH /guru-mapel/materi/{id} (backend memastikan materi ini memang
 * milik mapel yang ditugaskan ke guru yang login). */
function MateriRow({ materi, onSaved }: { materi: MateriTarget; onSaved: () => void }) {
  const [editing, setEditing] = useState(false)
  const [judul, setJudul] = useState(materi.judul)

  const patchMutation = useMutation({
    mutationFn: () => patchMateriSaya(materi.id, { judul }),
    onSuccess: () => {
      setEditing(false)
      onSaved()
    },
  })

  if (editing) {
    return (
      <li className="space-y-1.5 py-1.5">
        <form
          className="flex min-w-0 gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            patchMutation.mutate()
          }}
        >
          <Input className="min-w-0 flex-1" value={judul} onChange={(e) => setJudul(e.target.value)} required autoFocus />
          <Button type="submit" size="sm" loading={patchMutation.isPending} className="shrink-0">
            Simpan
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="shrink-0"
            onClick={() => {
              setJudul(materi.judul)
              setEditing(false)
              patchMutation.reset()
            }}
          >
            Batal
          </Button>
        </form>
        {patchMutation.isError && (
          <ErrorNotice
            message={patchMutation.error instanceof ApiError ? patchMutation.error.message : 'Gagal menyimpan materi.'}
          />
        )}
      </li>
    )
  }

  return (
    <li className="flex min-w-0 items-center justify-between gap-2 py-1.5">
      <span className="min-w-0 truncate text-foreground">{materi.judul}</span>
      <Button size="sm" variant="secondary" className="shrink-0" onClick={() => setEditing(true)}>
        Edit
      </Button>
    </li>
  )
}

export function MapelSayaPage() {
  const queryClient = useQueryClient()
  const mapelQuery = useQuery({ queryKey: ['guru-mapel', 'mapel-saya'], queryFn: getMapelSaya })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['guru-mapel', 'mapel-saya'] })

  return (
    <div>
      <PageHeader title="Mapel Saya" description="Mapel yang Anda ajar, dan materi di dalamnya -- bisa diubah di sini." />

      {mapelQuery.isError ? (
        <ErrorNotice
          message={mapelQuery.error instanceof ApiError ? mapelQuery.error.message : 'Gagal memuat mapel.'}
        />
      ) : mapelQuery.isLoading ? (
        <Spinner />
      ) : mapelQuery.data && mapelQuery.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada mapel yang ditugaskan ke Anda.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {mapelQuery.data?.map((mapel) => (
            <Card key={mapel.id}>
              <CardHeader>
                <CardTitle className="min-w-0 truncate">
                  {mapel.nama} <Badge className="ml-1">{mapel.kode}</Badge>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <ul className="divide-y divide-border text-sm">
                  {mapel.materi.map((m) => (
                    <MateriRow key={m.id} materi={m} onSaved={refresh} />
                  ))}
                  {mapel.materi.length === 0 && <li className="py-1.5 text-muted-foreground">Belum ada materi.</li>}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
