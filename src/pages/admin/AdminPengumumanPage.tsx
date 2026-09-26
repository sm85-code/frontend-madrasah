import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createPengumuman } from '../../api/admin'
import { getPengumuman } from '../../api/public'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { Spinner } from '../../components/ui/Feedback'
import { Input, Label, Textarea } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'

export function AdminPengumumanPage() {
  const queryClient = useQueryClient()
  const pengumumanQuery = useQuery({ queryKey: ['pengumuman-publik'], queryFn: getPengumuman })
  const [judul, setJudul] = useState('')
  const [isi, setIsi] = useState('')

  const mutation = useMutation({
    mutationFn: () => createPengumuman({ judul, isi }),
    onSuccess: () => {
      setJudul('')
      setIsi('')
      queryClient.invalidateQueries({ queryKey: ['pengumuman-publik'] })
    },
  })

  return (
    <div>
      <PageHeader title="Pengumuman" description="Tampil di halaman publik & untuk semua wali santri." />

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
            <Button type="submit" loading={mutation.isPending}>
              Terbitkan
            </Button>
          </form>
        </CardBody>
      </Card>

      {pengumumanQuery.isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-3">
          {pengumumanQuery.data?.map((p) => (
            <Card key={p.id}>
              <CardBody>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold text-slate-800">{p.judul}</h3>
                  <span className="shrink-0 text-xs text-slate-400">{p.tanggal}</span>
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{p.isi}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
