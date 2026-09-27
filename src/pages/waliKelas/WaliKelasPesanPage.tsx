import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { listRombelScoped, listSantriScoped } from '../../api/shared'
import { kirimPesanWaliKelas, listPesanWaliKelas } from '../../api/waliKelas'
import { ApiError } from '../../lib/apiClient'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { Label, Select, Textarea } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'

export function WaliKelasPesanPage() {
  const queryClient = useQueryClient()
  const rombelQuery = useQuery({ queryKey: ['scoped', 'rombel'], queryFn: listRombelScoped })
  const [rombelId, setRombelId] = useState('')
  const [santriId, setSantriId] = useState('')
  const [isi, setIsi] = useState('')

  const santriQuery = useQuery({
    queryKey: ['scoped', 'santri', rombelId],
    queryFn: () => listSantriScoped(rombelId),
    enabled: !!rombelId,
  })

  const pesanQuery = useQuery({
    queryKey: ['wali-kelas', 'pesan', santriId],
    queryFn: () => listPesanWaliKelas(santriId),
    enabled: !!santriId,
  })

  const kirimMutation = useMutation({
    mutationFn: () => kirimPesanWaliKelas(santriId, isi),
    onSuccess: () => {
      setIsi('')
      queryClient.invalidateQueries({ queryKey: ['wali-kelas', 'pesan', santriId] })
    },
  })

  return (
    <div>
      <PageHeader title="Pesan ke Wali Santri" description="Percakapan per santri dengan orang tua/walinya." />

      <Card className="mb-5">
        <CardBody>
          <div className="flex flex-wrap gap-4">
            <div className="w-56">
              <Label htmlFor="rombel-pesan">Rombel</Label>
              <Select id="rombel-pesan" value={rombelId} onChange={(e) => { setRombelId(e.target.value); setSantriId('') }}>
                <option value="">Pilih rombel</option>
                {rombelQuery.data?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-56">
              <Label htmlFor="santri-pesan">Santri</Label>
              <Select id="santri-pesan" value={santriId} onChange={(e) => setSantriId(e.target.value)} disabled={!rombelId}>
                <option value="">Pilih santri</option>
                {santriQuery.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {santriId && (
        <Card>
          <CardBody>
            {pesanQuery.isLoading ? (
              <Spinner />
            ) : (
              <div className="mb-4 max-h-80 space-y-3 overflow-y-auto">
                {pesanQuery.data?.map((p) => (
                  <div key={p.id} className="rounded-lg bg-muted/40 px-3 py-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {p.dari_nama} · {new Date(p.dibuat_pada).toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-foreground">{p.isi}</p>
                  </div>
                ))}
                {pesanQuery.data?.length === 0 && <p className="text-sm text-muted-foreground">Belum ada pesan.</p>}
              </div>
            )}
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                kirimMutation.mutate()
              }}
            >
              <Textarea rows={2} placeholder="Tulis pesan…" value={isi} onChange={(e) => setIsi(e.target.value)} required />
              <Button type="submit" loading={kirimMutation.isPending}>
                Kirim
              </Button>
            </form>
            {kirimMutation.isError && (
              <div className="mt-2">
                <ErrorNotice message={kirimMutation.error instanceof ApiError ? kirimMutation.error.message : 'Gagal mengirim pesan.'} />
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
