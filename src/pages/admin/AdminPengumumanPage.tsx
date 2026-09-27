import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createPengumuman, listPengumumanAdmin } from '../../api/admin'
import { ApiError } from '../../lib/apiClient'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { Input, Label, Textarea } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import { canWrite, INFO_AKADEMIK_ROLES } from '../../config/roles'
import { useAuthStore } from '../../store/authStore'

export function AdminPengumumanPage() {
  const queryClient = useQueryClient()
  const role = useAuthStore((s) => s.user?.role)
  const writable = canWrite(role, INFO_AKADEMIK_ROLES)
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

  return (
    <div>
      <PageHeader title="Pengumuman" description="Daftar sesuai unit Anda. Halaman publik tetap menampilkan semua unit." />

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
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
