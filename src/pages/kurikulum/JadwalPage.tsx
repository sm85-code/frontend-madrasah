import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createJadwal, deleteJadwal, listJadwal, listMapel } from '../../api/kurikulum'
import { listRombel } from '../../api/admin'
import { ApiError } from '../../lib/apiClient'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { DeleteRowButton } from '../../components/ui/DeleteRowButton'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { Input, Label, Select } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Jadwal } from '../../types'

const HARI_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export function JadwalPage() {
  const queryClient = useQueryClient()
  const rombelQuery = useQuery({ queryKey: ['admin', 'rombel'], queryFn: listRombel })
  const mapelQuery = useQuery({ queryKey: ['kurikulum', 'mapel'], queryFn: listMapel })

  const [rombelId, setRombelId] = useState('')
  const [mapelId, setMapelId] = useState('')
  const [hari, setHari] = useState('Senin')
  const [jamMulai, setJamMulai] = useState('07:00')
  const [jamSelesai, setJamSelesai] = useState('08:00')

  const jadwalQuery = useQuery({
    queryKey: ['kurikulum', 'jadwal', rombelId],
    queryFn: () => listJadwal(rombelId || undefined),
  })

  const createMutation = useMutation({
    mutationFn: () => createJadwal({ rombel_id: rombelId, mapel_id: mapelId, hari, jam_mulai: jamMulai, jam_selesai: jamSelesai }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kurikulum', 'jadwal'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteJadwal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kurikulum', 'jadwal'] }),
  })

  const columns: Column<Jadwal>[] = [
    { header: 'Hari', cell: (j) => j.hari },
    { header: 'Jam', cell: (j) => `${j.jam_mulai}-${j.jam_selesai}` },
    { header: 'Mapel', cell: (j) => j.mapel ?? '-' },
    {
      header: '',
      className: 'w-10 text-right',
      cell: (j) => <DeleteRowButton onClick={() => deleteMutation.mutate(j.id)} />,
    },
  ]

  return (
    <div>
      <PageHeader title="Jadwal" description="Jadwal mapel per rombel." />

      <Card className="mb-5">
        <CardBody>
          <div className="mb-4 max-w-xs">
            <Label htmlFor="filter-rombel-jadwal">Rombel</Label>
            <Select id="filter-rombel-jadwal" value={rombelId} onChange={(e) => setRombelId(e.target.value)}>
              <option value="">Pilih rombel</option>
              {rombelQuery.data?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </Select>
          </div>

          {rombelId && (
            <form
              className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
              onSubmit={(e) => {
                e.preventDefault()
                createMutation.mutate()
              }}
            >
              <div>
                <Label htmlFor="mapel-jadwal">Mapel</Label>
                <Select id="mapel-jadwal" value={mapelId} onChange={(e) => setMapelId(e.target.value)} required>
                  <option value="">Pilih mapel</option>
                  {mapelQuery.data?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="hari-jadwal">Hari</Label>
                <Select id="hari-jadwal" value={hari} onChange={(e) => setHari(e.target.value)}>
                  {HARI_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="mulai-jadwal">Jam mulai</Label>
                <Input id="mulai-jadwal" type="time" value={jamMulai} onChange={(e) => setJamMulai(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="selesai-jadwal">Jam selesai</Label>
                <Input id="selesai-jadwal" type="time" value={jamSelesai} onChange={(e) => setJamSelesai(e.target.value)} />
              </div>
              <Button type="submit" loading={createMutation.isPending} className="self-end">
                Tambah
              </Button>
              {createMutation.isError && (
                <div className="sm:col-span-2 lg:col-span-5">
                  <ErrorNotice message={createMutation.error instanceof ApiError ? createMutation.error.message : 'Gagal menambah jadwal.'} />
                </div>
              )}
            </form>
          )}

          {rombelId && (jadwalQuery.isLoading ? <Spinner /> : <DataTable columns={columns} rows={jadwalQuery.data ?? []} rowKey={(j) => j.id} />)}
        </CardBody>
      </Card>
    </div>
  )
}
