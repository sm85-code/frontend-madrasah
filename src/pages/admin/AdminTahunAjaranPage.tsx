import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  aktifkanSemester,
  createSemester,
  createTahunAjaran,
  listSemester,
  listTahunAjaran,
  tutupSemester,
} from '../../api/akademik'
import { ApiError } from '../../lib/apiClient'
import { Badge } from '../../components/ui/AppBadge'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { Input, Label, Select } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import { INFO_AKADEMIK_ROLES } from '../../config/roles'
import { useCanWrite } from '../../hooks/useCanWrite'
import type { Semester } from '../../types'

const STATUS_TONE: Record<Semester['status'], 'success' | 'neutral' | 'warning'> = {
  aktif: 'success',
  draft: 'neutral',
  ditutup: 'warning',
}

export function AdminTahunAjaranPage() {
  const queryClient = useQueryClient()
  const writable = useCanWrite(INFO_AKADEMIK_ROLES)
  const tahunAjaranQuery = useQuery({ queryKey: ['akademik', 'tahun-ajaran'], queryFn: listTahunAjaran })
  const semesterQuery = useQuery({ queryKey: ['akademik', 'semester'], queryFn: listSemester })

  const [kode, setKode] = useState('')
  const [mulaiTahun, setMulaiTahun] = useState('')
  const [selesaiTahun, setSelesaiTahun] = useState('')

  const [tahunAjaranId, setTahunAjaranId] = useState('')
  const [namaSemester, setNamaSemester] = useState<'Ganjil' | 'Genap'>('Ganjil')
  const [mulaiSemester, setMulaiSemester] = useState('')
  const [selesaiSemester, setSelesaiSemester] = useState('')

  const createTahunMutation = useMutation({
    mutationFn: () => createTahunAjaran({ kode, tanggal_mulai: mulaiTahun, tanggal_selesai: selesaiTahun }),
    onSuccess: () => {
      setKode('')
      setMulaiTahun('')
      setSelesaiTahun('')
      queryClient.invalidateQueries({ queryKey: ['akademik', 'tahun-ajaran'] })
    },
  })

  const createSemesterMutation = useMutation({
    mutationFn: () =>
      createSemester({
        tahun_ajaran_id: tahunAjaranId,
        nama: namaSemester,
        tanggal_mulai: mulaiSemester,
        tanggal_selesai: selesaiSemester,
      }),
    onSuccess: () => {
      setMulaiSemester('')
      setSelesaiSemester('')
      queryClient.invalidateQueries({ queryKey: ['akademik', 'semester'] })
    },
  })

  const aktifkanMutation = useMutation({
    mutationFn: aktifkanSemester,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['akademik', 'semester'] }),
  })

  const tutupMutation = useMutation({
    mutationFn: tutupSemester,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['akademik', 'semester'] }),
  })

  const columns: Column<Semester>[] = [
    { header: 'Tahun Ajaran', cell: (s) => s.tahun_ajaran ?? '-' },
    { header: 'Semester', cell: (s) => s.nama },
    { header: 'Periode', cell: (s) => `${s.tanggal_mulai} s/d ${s.tanggal_selesai}` },
    { header: 'Status', cell: (s) => <Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge> },
    {
      header: 'Aksi',
      cell: (s) =>
        writable ? (
        <div className="flex gap-1">
          {s.status !== 'aktif' && (
            <Button size="sm" onClick={() => aktifkanMutation.mutate(s.id)}>
              Aktifkan
            </Button>
          )}
          {s.status === 'aktif' && (
            <Button size="sm" variant="danger" onClick={() => tutupMutation.mutate(s.id)}>
              Tutup
            </Button>
          )}
        </div>
        ) : (
          <span className="text-sm text-muted-foreground">Lihat saja</span>
        ),
    },
  ]

  return (
    <div>
      <PageHeader title="Tahun Ajaran & Semester" description="Fondasi periode akademik untuk akademik & keuangan." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tahun Ajaran</CardTitle>
          </CardHeader>
          <CardBody>
            {writable && (
            <form
              className="mb-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                createTahunMutation.mutate()
              }}
            >
              <div>
                <Label htmlFor="kode-ta">Kode (mis. 2025/2026)</Label>
                <Input id="kode-ta" value={kode} onChange={(e) => setKode(e.target.value)} required />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="mulai-ta">Mulai</Label>
                  <Input id="mulai-ta" type="date" value={mulaiTahun} onChange={(e) => setMulaiTahun(e.target.value)} required />
                </div>
                <div className="flex-1">
                  <Label htmlFor="selesai-ta">Selesai</Label>
                  <Input id="selesai-ta" type="date" value={selesaiTahun} onChange={(e) => setSelesaiTahun(e.target.value)} required />
                </div>
              </div>
              {createTahunMutation.isError && (
                <ErrorNotice
                  message={createTahunMutation.error instanceof ApiError ? createTahunMutation.error.message : 'Gagal menambah tahun ajaran.'}
                />
              )}
              <Button type="submit" loading={createTahunMutation.isPending}>
                Tambah Tahun Ajaran
              </Button>
            </form>
            )}
            <div className="space-y-1 text-sm text-muted-foreground">
              {tahunAjaranQuery.data?.map((t) => (
                <div key={t.id}>{t.kode}</div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Semester Baru</CardTitle>
          </CardHeader>
          <CardBody>
            {writable ? (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                createSemesterMutation.mutate()
              }}
            >
              <div>
                <Label htmlFor="ta-semester">Tahun Ajaran</Label>
                <Select id="ta-semester" value={tahunAjaranId} onChange={(e) => setTahunAjaranId(e.target.value)} required>
                  <option value="">Pilih tahun ajaran</option>
                  {tahunAjaranQuery.data?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.kode}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="nama-semester">Semester</Label>
                <Select
                  id="nama-semester"
                  value={namaSemester}
                  onChange={(e) => setNamaSemester(e.target.value as 'Ganjil' | 'Genap')}
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </Select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="mulai-sem">Mulai</Label>
                  <Input id="mulai-sem" type="date" value={mulaiSemester} onChange={(e) => setMulaiSemester(e.target.value)} required />
                </div>
                <div className="flex-1">
                  <Label htmlFor="selesai-sem">Selesai</Label>
                  <Input id="selesai-sem" type="date" value={selesaiSemester} onChange={(e) => setSelesaiSemester(e.target.value)} required />
                </div>
              </div>
              {createSemesterMutation.isError && (
                <ErrorNotice
                  message={createSemesterMutation.error instanceof ApiError ? createSemesterMutation.error.message : 'Gagal menambah semester.'}
                />
              )}
              <Button type="submit" loading={createSemesterMutation.isPending}>
                Tambah Semester
              </Button>
            </form>
            ) : (
              <p className="text-sm text-muted-foreground">Lihat saja. Tahun ajaran per unit.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Semua Semester</CardTitle>
        </CardHeader>
        <CardBody>
          {semesterQuery.isLoading ? <Spinner /> : <DataTable columns={columns} rows={semesterQuery.data ?? []} rowKey={(s) => s.id} />}
        </CardBody>
      </Card>
    </div>
  )
}
