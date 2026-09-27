import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { listRombelScoped, listSantriScoped } from '../../api/shared'
import { submitProgres } from '../../api/waliKelas'
import { ApiError } from '../../lib/apiClient'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { ErrorNotice, SuccessNotice } from '../../components/ui/Feedback'
import { Input, Label, Select, Textarea } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'

export function WaliKelasProgresPage() {
  const rombelQuery = useQuery({ queryKey: ['scoped', 'rombel'], queryFn: listRombelScoped })
  const [rombelId, setRombelId] = useState('')
  const santriQuery = useQuery({
    queryKey: ['scoped', 'santri', rombelId],
    queryFn: () => listSantriScoped(rombelId),
    enabled: !!rombelId,
  })

  const [santriId, setSantriId] = useState('')
  const [tipe, setTipe] = useState('Hafalan')
  const [capaian, setCapaian] = useState('')
  const [catatan, setCatatan] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      submitProgres({
        tanggal: new Date().toISOString().slice(0, 10),
        santri_id: santriId,
        tipe,
        capaian,
        catatan_guru: catatan,
      }),
    onSuccess: () => {
      setCapaian('')
      setCatatan('')
    },
  })

  return (
    <div>
      <PageHeader title="Progres Santri" description="Catat progres hafalan/pelajaran harian." />

      <Card>
        <CardBody>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              mutation.mutate()
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="rombel-progres">Rombel</Label>
                <Select id="rombel-progres" value={rombelId} onChange={(e) => setRombelId(e.target.value)}>
                  <option value="">Pilih rombel</option>
                  {rombelQuery.data?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nama}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="santri-progres">Santri</Label>
                <Select id="santri-progres" value={santriId} onChange={(e) => setSantriId(e.target.value)} required disabled={!rombelId}>
                  <option value="">Pilih santri</option>
                  {santriQuery.data?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="tipe-progres">Tipe</Label>
              <Input id="tipe-progres" value={tipe} onChange={(e) => setTipe(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="capaian-progres">Capaian</Label>
              <Input id="capaian-progres" placeholder="mis. Juz 5 halaman 1-3" value={capaian} onChange={(e) => setCapaian(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="catatan-progres">Catatan guru</Label>
              <Textarea id="catatan-progres" rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
            </div>

            {mutation.isSuccess && <SuccessNotice message="Progres tersimpan." />}
            {mutation.isError && (
              <ErrorNotice message={mutation.error instanceof ApiError ? mutation.error.message : 'Gagal menyimpan progres.'} />
            )}

            <Button type="submit" loading={mutation.isPending}>
              Simpan Progres
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
