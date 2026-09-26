import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createGuru, createWaliSantri, deleteGuru, deleteWaliSantri, listGuru, listWaliSantri } from '../../api/admin'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Spinner } from '../../components/ui/Feedback'
import { Input, Label, Select } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import type { User } from '../../types'

const GURU_ROLE_OPTIONS = [
  { value: 'wali_kelas', label: 'Wali Kelas' },
  { value: 'guru', label: 'Guru Mapel' },
  { value: 'kurikulum', label: 'Kurikulum' },
  { value: 'bendahara', label: 'Bendahara' },
  { value: 'kepala_sekolah', label: 'Kepala Sekolah' },
]

export function AdminGuruPage() {
  const queryClient = useQueryClient()
  const guruQuery = useQuery({ queryKey: ['admin', 'guru'], queryFn: listGuru })
  const waliSantriQuery = useQuery({ queryKey: ['admin', 'wali-santri'], queryFn: listWaliSantri })

  const [namaGuru, setNamaGuru] = useState('')
  const [noHpGuru, setNoHpGuru] = useState('')
  const [roleGuru, setRoleGuru] = useState('wali_kelas')

  const [namaWali, setNamaWali] = useState('')
  const [noHpWali, setNoHpWali] = useState('')

  const createGuruMutation = useMutation({
    mutationFn: () => createGuru({ nama: namaGuru, no_hp: noHpGuru, role: roleGuru }),
    onSuccess: () => {
      setNamaGuru('')
      setNoHpGuru('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'guru'] })
    },
  })

  const deleteGuruMutation = useMutation({
    mutationFn: deleteGuru,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'guru'] }),
  })

  const createWaliMutation = useMutation({
    mutationFn: () => createWaliSantri({ nama: namaWali, no_hp: noHpWali }),
    onSuccess: () => {
      setNamaWali('')
      setNoHpWali('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'wali-santri'] })
    },
  })

  const deleteWaliMutation = useMutation({
    mutationFn: deleteWaliSantri,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'wali-santri'] }),
  })

  const guruColumns: Column<User>[] = [
    { header: 'Nama', cell: (u) => u.nama },
    { header: 'Username', cell: (u) => u.no_hp },
    { header: 'Role', cell: (u) => u.role },
    {
      header: 'Aksi',
      cell: (u) => (
        <Button size="sm" variant="danger" onClick={() => deleteGuruMutation.mutate(u.id)}>
          Hapus
        </Button>
      ),
    },
  ]

  const waliColumns: Column<User>[] = [
    { header: 'Nama', cell: (u) => u.nama },
    { header: 'Username', cell: (u) => u.no_hp },
    {
      header: 'Aksi',
      cell: (u) => (
        <Button size="sm" variant="danger" onClick={() => deleteWaliMutation.mutate(u.id)}>
          Hapus
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Guru & Wali Santri" description="Kelola akun staf dan orang tua/wali santri." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Guru / Staf</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="mb-4 flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                createGuruMutation.mutate()
              }}
            >
              <div className="min-w-[140px] flex-1">
                <Label htmlFor="nama-guru">Nama</Label>
                <Input id="nama-guru" value={namaGuru} onChange={(e) => setNamaGuru(e.target.value)} required />
              </div>
              <div className="min-w-[130px]">
                <Label htmlFor="hp-guru">Username</Label>
                <Input id="hp-guru" placeholder="username" value={noHpGuru} onChange={(e) => setNoHpGuru(e.target.value)} required />
              </div>
              <div className="min-w-[150px]">
                <Label htmlFor="role-guru">Role</Label>
                <Select id="role-guru" value={roleGuru} onChange={(e) => setRoleGuru(e.target.value)}>
                  {GURU_ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <Button type="submit" loading={createGuruMutation.isPending}>
                Tambah
              </Button>
            </form>
            {guruQuery.isLoading ? <Spinner /> : <DataTable columns={guruColumns} rows={guruQuery.data ?? []} rowKey={(u) => u.id} />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wali Santri</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="mb-4 flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                createWaliMutation.mutate()
              }}
            >
              <div className="min-w-[140px] flex-1">
                <Label htmlFor="nama-wali">Nama</Label>
                <Input id="nama-wali" value={namaWali} onChange={(e) => setNamaWali(e.target.value)} required />
              </div>
              <div className="min-w-[130px]">
                <Label htmlFor="hp-wali">Username</Label>
                <Input id="hp-wali" placeholder="username" value={noHpWali} onChange={(e) => setNoHpWali(e.target.value)} required />
              </div>
              <Button type="submit" loading={createWaliMutation.isPending}>
                Tambah
              </Button>
            </form>
            {waliSantriQuery.isLoading ? (
              <Spinner />
            ) : (
              <DataTable columns={waliColumns} rows={waliSantriQuery.data ?? []} rowKey={(u) => u.id} />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
