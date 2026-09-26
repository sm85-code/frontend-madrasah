import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createRombel, createTingkat, deleteRombel, deleteTingkat, listRombel, listTingkat } from '../../api/admin'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Spinner } from '../../components/ui/Feedback'
import { Input, Label, Select } from '../../components/ui/Input'
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
      header: 'Aksi',
      cell: (t) => (
        <Button size="sm" variant="danger" onClick={() => deleteTingkatMutation.mutate(t.id)}>
          Hapus
        </Button>
      ),
    },
  ]

  const rombelColumns: Column<Rombel>[] = [
    { header: 'Nama', cell: (r) => r.nama },
    { header: 'Wali Kelas', cell: (r) => r.wali_kelas ?? '-' },
    {
      header: 'Aksi',
      cell: (r) => (
        <Button size="sm" variant="danger" onClick={() => deleteRombelMutation.mutate(r.id)}>
          Hapus
        </Button>
      ),
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
              className="mb-4 flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                createTingkatMutation.mutate()
              }}
            >
              <div className="flex-1">
                <Label htmlFor="nama-tingkat">Nama tingkat</Label>
                <Input id="nama-tingkat" value={namaTingkat} onChange={(e) => setNamaTingkat(e.target.value)} required />
              </div>
              <Button type="submit" loading={createTingkatMutation.isPending}>
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
              className="mb-4 flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                createRombelMutation.mutate()
              }}
            >
              <div className="flex-1">
                <Label htmlFor="nama-rombel">Nama rombel</Label>
                <Input id="nama-rombel" value={namaRombel} onChange={(e) => setNamaRombel(e.target.value)} required />
              </div>
              <div className="w-40">
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
              <Button type="submit" loading={createRombelMutation.isPending}>
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
