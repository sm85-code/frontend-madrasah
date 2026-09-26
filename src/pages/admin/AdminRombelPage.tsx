import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createRombel, createTingkat, deleteRombel, deleteTingkat, listRombel, listTingkat } from '../../api/admin'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/AppCard'
import { Button } from '../../components/ui/AppButton'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { DeleteRowButton } from '../../components/ui/DeleteRowButton'
import { Spinner } from '../../components/ui/Feedback'
import { Input, Label, Select } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Rombel, Tingkat } from '../../types'

export function AdminRombelPage() {
  const queryClient = useQueryClient()
  const tingkatQuery = useQuery({ queryKey: ['admin', 'tingkat'], queryFn: listTingkat })
  const rombelQuery = useQuery({ queryKey: ['admin', 'rombel'], queryFn: listRombel })

  const [namaTingkat, setNamaTingkat] = useState('')
  const [namaRombel, setNamaRombel] = useState('')
  const [tingkatId, setTingkatId] = useState('')

  const createTingkatMutation = useMutation({
    mutationFn: () => createTingkat({ nama: namaTingkat, urutan: (tingkatQuery.data?.length ?? 0) + 1 }),
    onSuccess: () => {
      setNamaTingkat('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'tingkat'] })
    },
  })

  const deleteTingkatMutation = useMutation({
    mutationFn: deleteTingkat,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'tingkat'] }),
  })

  const createRombelMutation = useMutation({
    mutationFn: () => createRombel({ nama: namaRombel, tingkat_id: tingkatId || null }),
    onSuccess: () => {
      setNamaRombel('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'rombel'] })
    },
  })

  const deleteRombelMutation = useMutation({
    mutationFn: deleteRombel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'rombel'] }),
  })

  const tingkatColumns: Column<Tingkat>[] = [
    { header: 'Nama', cell: (t) => t.nama },
    { header: 'Urutan', cell: (t) => t.urutan },
    {
      header: '',
      className: 'w-10 text-right',
      cell: (t) => <DeleteRowButton onClick={() => deleteTingkatMutation.mutate(t.id)} />,
    },
  ]

  const rombelColumns: Column<Rombel>[] = [
    { header: 'Nama', cell: (r) => r.nama },
    { header: 'Wali Kelas', cell: (r) => r.wali_kelas ?? '-' },
    {
      header: '',
      className: 'w-10 text-right',
      cell: (r) => <DeleteRowButton onClick={() => deleteRombelMutation.mutate(r.id)} />,
    },
  ]

  return (
    <div>
      <PageHeader title="Rombel & Tingkat" description="Struktur kelas madrasah." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tingkat</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end"
              onSubmit={(e) => {
                e.preventDefault()
                createTingkatMutation.mutate()
              }}
            >
              <div className="flex-1">
                <Label htmlFor="nama-tingkat">Nama tingkat</Label>
                <Input id="nama-tingkat" value={namaTingkat} onChange={(e) => setNamaTingkat(e.target.value)} required />
              </div>
              <Button type="submit" loading={createTingkatMutation.isPending} className="w-full sm:w-auto">
                Tambah
              </Button>
            </form>
            {tingkatQuery.isLoading ? (
              <Spinner />
            ) : (
              <DataTable columns={tingkatColumns} rows={tingkatQuery.data ?? []} rowKey={(t) => t.id} />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rombel</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
              onSubmit={(e) => {
                e.preventDefault()
                createRombelMutation.mutate()
              }}
            >
              <div>
                <Label htmlFor="nama-rombel">Nama rombel</Label>
                <Input id="nama-rombel" value={namaRombel} onChange={(e) => setNamaRombel(e.target.value)} required />
              </div>
              <div className="sm:w-40">
                <Label htmlFor="tingkat-rombel">Tingkat</Label>
                <Select id="tingkat-rombel" value={tingkatId} onChange={(e) => setTingkatId(e.target.value)}>
                  <option value="">-</option>
                  {tingkatQuery.data?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama}
                    </option>
                  ))}
                </Select>
              </div>
              <Button type="submit" loading={createRombelMutation.isPending} className="w-full sm:col-span-2 sm:w-auto sm:justify-self-start">
                Tambah
              </Button>
            </form>
            {rombelQuery.isLoading ? (
              <Spinner />
            ) : (
              <DataTable columns={rombelColumns} rows={rombelQuery.data ?? []} rowKey={(r) => r.id} />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
