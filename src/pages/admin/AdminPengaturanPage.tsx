import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createKegiatan, deleteKegiatan } from '../../api/admin'
import { getKegiatan } from '../../api/public'
import { ApiError } from '../../lib/apiClient'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/AppCard'
import { DeleteRowButton } from '../../components/ui/DeleteRowButton'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { Input, Label, Textarea } from '../../components/ui/AppInput'
import { INFO_AKADEMIK_ROLES } from '../../config/roles'
import { useCanWrite } from '../../hooks/useCanWrite'

export function AdminPengaturanPage() {
  const queryClient = useQueryClient()
  const kegiatanQuery = useQuery({ queryKey: ['kegiatan-publik'], queryFn: getKegiatan })

  const [judulKegiatan, setJudulKegiatan] = useState('')
  const [deskripsiKegiatan, setDeskripsiKegiatan] = useState('')

  const createKegiatanMutation = useMutation({
    mutationFn: () => createKegiatan({ judul: judulKegiatan, deskripsi: deskripsiKegiatan }),
    onSuccess: () => {
      setJudulKegiatan('')
      setDeskripsiKegiatan('')
      queryClient.invalidateQueries({ queryKey: ['kegiatan-publik'] })
    },
  })

  const deleteKegiatanMutation = useMutation({
    mutationFn: deleteKegiatan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kegiatan-publik'] }),
  })

  return (
    <div>
      <PageHeader title="Kegiatan & Program" description="Kegiatan yang tampil di halaman publik." />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Kegiatan & Program</CardTitle>
        </CardHeader>
        <CardBody>
          <form
            className="mb-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              createKegiatanMutation.mutate()
            }}
          >
            <div>
              <Label htmlFor="judul-kegiatan">Judul</Label>
              <Input id="judul-kegiatan" placeholder="mis. Tahfidz Al-Qur'an" value={judulKegiatan} onChange={(e) => setJudulKegiatan(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="deskripsi-kegiatan">Deskripsi singkat</Label>
              <Textarea id="deskripsi-kegiatan" rows={2} value={deskripsiKegiatan} onChange={(e) => setDeskripsiKegiatan(e.target.value)} />
            </div>
            {createKegiatanMutation.isError && (
              <ErrorNotice
                message={createKegiatanMutation.error instanceof ApiError ? createKegiatanMutation.error.message : 'Gagal menambah kegiatan.'}
              />
            )}
            <Button type="submit" loading={createKegiatanMutation.isPending}>
              Tambah Kegiatan
            </Button>
          </form>

          {kegiatanQuery.isLoading ? (
            <Spinner />
          ) : kegiatanQuery.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada kegiatan.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {kegiatanQuery.data?.map((k) => (
                <li key={k.id} className="flex items-start justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{k.judul}</p>
                    {k.deskripsi && <p className="mt-0.5 text-muted-foreground">{k.deskripsi}</p>}
                  </div>
                  <DeleteRowButton onClick={() => deleteKegiatanMutation.mutate(k.id)} label={`Hapus ${k.judul}`} itemName={k.judul} />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
