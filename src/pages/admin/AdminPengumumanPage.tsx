import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createPengumuman, deletePengumuman, listPengumumanAdmin, patchPengumuman } from '../../api/admin'
import { ApiError } from '../../lib/apiClient'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { DeleteRowButton } from '../../components/ui/DeleteRowButton'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { Input, Label, Textarea } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import { PENGUMUMAN_WRITE_ROLES } from '../../config/roles'
import { useCanWrite } from '../../hooks/useCanWrite'

export function AdminPengumumanPage() {
  const queryClient = useQueryClient()
  const writable = useCanWrite(PENGUMUMAN_WRITE_ROLES)
  const pengumumanQuery = useQuery({ queryKey: ['admin', 'pengumuman'], queryFn: listPengumumanAdmin })
  const [judul, setJudul] = useState('')
  const [isi, setIsi] = useState('')

  const mutation = useMutation({
    mutationFn: () => createPengumuman({ judul, isi }),
    onSuccess: () => {
      setJudul('')
      setIsi('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'pengumuman'] })
    },
  })
  const patchMutation = useMutation({
    mutationFn: ({ id, publik }: { id: string; publik: boolean }) => patchPengumuman(id, { publik }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'pengumuman'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: deletePengumuman,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'pengumuman'] }),
  })

  return (
    <div>
      <PageHeader title="Pengumuman" description="Yang tampil di halaman publik. Kepala/Admin Lembaga hanya unitnya. Yayasan melihat saja." />

      {writable && (
        <Card className="mb-5">
          <CardBody>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                mutation.mutate()
              }}
            >
              <div>
                <Label htmlFor="judul-pengumuman">Judul</Label>
                <Input id="judul-pengumuman" value={judul} onChange={(e) => setJudul(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="isi-pengumuman">Isi</Label>
                <Textarea id="isi-pengumuman" rows={4} value={isi} onChange={(e) => setIsi(e.target.value)} />
              </div>
              {mutation.isError && (
                <ErrorNotice message={mutation.error instanceof ApiError ? mutation.error.message : 'Gagal menerbitkan pengumuman.'} />
              )}
              <Button type="submit" loading={mutation.isPending}>
                Terbitkan
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      {pengumumanQuery.isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-3">
          {pengumumanQuery.data?.map((p) => (
            <Card key={p.id}>
              <CardBody>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold text-foreground">{p.judul}</h3>
                  <span className="shrink-0 text-xs text-muted-foreground">{p.tanggal}</span>
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{p.isi}</p>
                <p className="mt-2 text-xs text-muted-foreground">{p.publik === false ? 'Disembunyikan dari halaman publik' : 'Tampil di halaman publik'}</p>
                {writable && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={patchMutation.isPending}
                      onClick={() => patchMutation.mutate({ id: p.id, publik: p.publik === false })}
                    >
                      {p.publik === false ? 'Tampilkan' : 'Sembunyikan'}
                    </Button>
                    <DeleteRowButton onClick={() => deleteMutation.mutate(p.id)} itemName={p.judul} />
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
