import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createSantri, deleteSantri, listRombel, listSantriAdmin, listWaliSantri, patchSantri, setSantriStatus } from '../../api/admin'
import { ApiError } from '../../lib/apiClient'
import { Badge } from '../../components/ui/AppBadge'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { DeleteRowButton } from '../../components/ui/DeleteRowButton'
import { ErrorNotice, Spinner, SuccessNotice } from '../../components/ui/Feedback'
import { Input, Label, Select } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import { KkOcrDialog } from '../../components/admin/KkOcrDialog'
import type { KkAnggotaKeluarga, KkOcrResult, Santri } from '../../types'
import { SANTRI_WRITE_ROLES } from '../../config/roles'
import { useCanWrite } from '../../hooks/useCanWrite'
import { useUnitStore } from '../../store/unitStore'

const AGAMA_OPTIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu', 'Kepercayaan']

interface KependudukanState {
  nik: string
  tempatLahir: string
  tanggalLahir: string
  jenisKelamin: '' | 'L' | 'P'
  agama: string
  statusDalamKeluarga: string
  alamatLengkap: string
  nomorKk: string
  namaAyah: string
  namaIbu: string
  rtRw: string
  kodePos: string
  desaKelurahan: string
  kecamatan: string
  kabupatenKota: string
  provinsi: string
}

const KEPENDUDUKAN_KOSONG: KependudukanState = {
  nik: '',
  tempatLahir: '',
  tanggalLahir: '',
  jenisKelamin: '',
  agama: '',
  statusDalamKeluarga: '',
  alamatLengkap: '',
  nomorKk: '',
  namaAyah: '',
  namaIbu: '',
  rtRw: '',
  kodePos: '',
  desaKelurahan: '',
  kecamatan: '',
  kabupatenKota: '',
  provinsi: '',
}

function kependudukanPayload(k: KependudukanState) {
  return {
    nik: k.nik || null,
    tempat_lahir: k.tempatLahir || null,
    tanggal_lahir: k.tanggalLahir || null,
    jenis_kelamin: k.jenisKelamin || null,
    agama: k.agama || null,
    status_dalam_keluarga: k.statusDalamKeluarga || null,
    alamat_lengkap: k.alamatLengkap || null,
    nomor_kk: k.nomorKk || null,
    nama_ayah: k.namaAyah || null,
    nama_ibu: k.namaIbu || null,
    rt_rw: k.rtRw || null,
    kode_pos: k.kodePos || null,
    desa_kelurahan: k.desaKelurahan || null,
    kecamatan: k.kecamatan || null,
    kabupaten_kota: k.kabupatenKota || null,
    provinsi: k.provinsi || null,
  }
}

const STATUS_TONE: Record<string, 'success' | 'neutral' | 'warning'> = {
  aktif: 'success',
  lulus: 'neutral',
  keluar: 'warning',
  pindah: 'warning',
}

export function AdminSantriPage() {
  const queryClient = useQueryClient()
  const writable = useCanWrite(SANTRI_WRITE_ROLES)
  const [nama, setNama] = useState('')
  const [namaWali, setNamaWali] = useState('')
  const [rombelId, setRombelId] = useState('')
  const [filterStatus, setFilterStatus] = useState('semua')
  const [waliBaru, setWaliBaru] = useState<{ nama: string; username: string; password: string } | null>(null)
  const [kependudukan, setKependudukan] = useState<KependudukanState>(KEPENDUDUKAN_KOSONG)
  const [showKependudukan, setShowKependudukan] = useState(false)

  function isiDariKk(anggota: KkAnggotaKeluarga, kk: KkOcrResult) {
    if (anggota.nama) setNama(anggota.nama)
    setKependudukan({
      nik: anggota.nik ?? '',
      tempatLahir: anggota.tempat_lahir ?? '',
      tanggalLahir: anggota.tanggal_lahir ?? '',
      jenisKelamin: anggota.jenis_kelamin ?? '',
      agama: anggota.agama ?? '',
      statusDalamKeluarga: anggota.status_dalam_keluarga ?? '',
      alamatLengkap: kk.alamat_lengkap ?? '',
      nomorKk: kk.nomor_kk ?? '',
      namaAyah: anggota.nama_ayah ?? '',
      namaIbu: anggota.nama_ibu ?? '',
      rtRw: kk.rt_rw ?? '',
      kodePos: kk.kode_pos ?? '',
      desaKelurahan: kk.desa_kelurahan ?? '',
      kecamatan: kk.kecamatan ?? '',
      kabupatenKota: kk.kabupaten_kota ?? '',
      provinsi: kk.provinsi ?? '',
    })
    setShowKependudukan(true)
  }

  const selectedUnitId = useUnitStore((s) => s.selectedUnitId)
  const santriQuery = useQuery({
    queryKey: ['admin', 'santri', filterStatus, selectedUnitId],
    queryFn: () => listSantriAdmin(filterStatus),
  })
  const rombelQuery = useQuery({ queryKey: ['admin', 'rombel', selectedUnitId], queryFn: listRombel })
  const waliQuery = useQuery({ queryKey: ['admin', 'wali-santri', selectedUnitId], queryFn: listWaliSantri })

  const createMutation = useMutation({
    mutationFn: () =>
      createSantri({
        nama,
        nama_wali: namaWali,
        rombel_id: rombelId || null,
        ...kependudukanPayload(kependudukan),
      }),
    onSuccess: (created) => {
      setNama('')
      setNamaWali('')
      setRombelId('')
      setKependudukan(KEPENDUDUKAN_KOSONG)
      setShowKependudukan(false)
      if (created.wali_password_sementara && created.wali_username) {
        setWaliBaru({ nama: namaWali || created.nama, username: created.wali_username, password: created.wali_password_sementara })
      } else {
        setWaliBaru(null)
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'santri'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'wali-santri'] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => setSantriStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'santri'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSantri,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'santri'] }),
  })

  const patchMutation = useMutation({
    mutationFn: ({ id, orang_tua_id }: { id: string; orang_tua_id: string | null }) =>
      patchSantri(id, { orang_tua_id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'santri'] }),
  })

  const rombelName = (id: string | null) => rombelQuery.data?.find((r) => r.id === id)?.nama ?? '-'

  const waliName = (id: string | null) =>
    waliQuery.data?.find((w) => w.id === id)?.nama ?? (id ? 'Wali terhapus' : '-')

  const columns: Column<Santri>[] = [
    { header: 'Nama', cell: (s) => s.nama },
    { header: 'Rombel', cell: (s) => rombelName(s.rombel_id) },
    {
      header: 'Wali Santri',
      cell: (s) =>
        writable ? (
          <Select
            className="w-auto min-w-[140px]"
            value={s.orang_tua_id ?? ''}
            onChange={(e) =>
              patchMutation.mutate({ id: s.id, orang_tua_id: e.target.value || null })
            }
          >
            <option value="">Belum diikat</option>
            {waliQuery.data?.map((w) => (
              <option key={w.id} value={w.id}>
                {w.nama}
              </option>
            ))}
          </Select>
        ) : (
          <span>{s.orang_tua || waliName(s.orang_tua_id)}</span>
        ),
    },
    {
      header: 'Status',
      cell: (s) => <Badge tone={STATUS_TONE[s.status ?? 'aktif']}>{s.status ?? 'aktif'}</Badge>,
    },
    {
      header: 'Aksi',
      cell: (s) =>
        writable ? (
        <div className="flex gap-1">
          {s.status !== 'aktif' && (
            <Button size="sm" variant="secondary" onClick={() => statusMutation.mutate({ id: s.id, status: 'aktif' })}>
              Aktifkan
            </Button>
          )}
          {s.status !== 'lulus' && (
            <Button size="sm" variant="secondary" onClick={() => statusMutation.mutate({ id: s.id, status: 'lulus' })}>
              Luluskan
            </Button>
          )}
          {s.status !== 'keluar' && (
            <Button size="sm" variant="danger" onClick={() => statusMutation.mutate({ id: s.id, status: 'keluar' })}>
              Keluarkan
            </Button>
          )}
          <DeleteRowButton
            onClick={() => deleteMutation.mutate(s.id)}
            pending={deleteMutation.isPending}
            itemName={`santri ${s.nama}`}
          />
        </div>
        ) : (
          <span className="text-xs text-muted-foreground">Lihat saja</span>
        ),
    },
  ]

  return (
    <div>
      <PageHeader title="Santri" description="Isi nama santri dan nama wali. Wali yang namanya sama di unit ini dipakai ulang." />

      {waliBaru && (
        <div className="mb-4">
          <SuccessNotice
            message={`Akun wali ${waliBaru.nama} dibuat. Username: ${waliBaru.username}. Password sementara: ${waliBaru.password}`}
          />
        </div>
      )}
      {createMutation.isError && (
        <div className="mb-4">
          <ErrorNotice message={createMutation.error instanceof ApiError ? createMutation.error.message : 'Gagal menambah santri.'} />
        </div>
      )}

      {writable && (
      <Card className="mb-5">
        <CardBody>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              createMutation.mutate()
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:items-end">
              <div className="min-w-0">
                <Label htmlFor="nama-santri">Nama santri</Label>
                <Input id="nama-santri" value={nama} onChange={(e) => setNama(e.target.value)} required />
              </div>
              <div className="min-w-0">
                <Label htmlFor="nama-wali">Nama wali santri</Label>
                <Input id="nama-wali" value={namaWali} onChange={(e) => setNamaWali(e.target.value)} required />
              </div>
              <div className="min-w-0">
                <Label htmlFor="rombel-santri">Rombel</Label>
                <Select id="rombel-santri" value={rombelId} onChange={(e) => setRombelId(e.target.value)}>
                  <option value="">Belum ditempatkan</option>
                  {rombelQuery.data?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nama}
                    </option>
                  ))}
                </Select>
              </div>
              <KkOcrDialog onPilih={isiDariKk} />
            </div>

            <div>
              <button
                type="button"
                className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                onClick={() => setShowKependudukan((v) => !v)}
              >
                {showKependudukan ? 'Sembunyikan data kependudukan' : 'Tampilkan data kependudukan (opsional)'}
              </button>
            </div>

            {showKependudukan && (
              <div className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="min-w-0">
                  <Label htmlFor="kd-nik">NIK</Label>
                  <Input
                    id="kd-nik"
                    value={kependudukan.nik}
                    onChange={(e) => setKependudukan((k) => ({ ...k, nik: e.target.value }))}
                  />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="kd-tempat-lahir">Tempat lahir</Label>
                  <Input
                    id="kd-tempat-lahir"
                    value={kependudukan.tempatLahir}
                    onChange={(e) => setKependudukan((k) => ({ ...k, tempatLahir: e.target.value }))}
                  />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="kd-tanggal-lahir">Tanggal lahir</Label>
                  <Input
                    id="kd-tanggal-lahir"
                    type="date"
                    value={kependudukan.tanggalLahir}
                    onChange={(e) => setKependudukan((k) => ({ ...k, tanggalLahir: e.target.value }))}
                  />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="kd-jenis-kelamin">Jenis kelamin</Label>
                  <Select
                    id="kd-jenis-kelamin"
                    value={kependudukan.jenisKelamin}
                    onChange={(e) =>
                      setKependudukan((k) => ({ ...k, jenisKelamin: e.target.value as KependudukanState['jenisKelamin'] }))
                    }
                  >
                    <option value="">-</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </Select>
                </div>
                <div className="min-w-0">
                  <Label htmlFor="kd-agama">Agama</Label>
                  <Select
                    id="kd-agama"
                    value={kependudukan.agama}
                    onChange={(e) => setKependudukan((k) => ({ ...k, agama: e.target.value }))}
                  >
                    <option value="">-</option>
                    {AGAMA_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="min-w-0">
                  <Label htmlFor="kd-status-keluarga">Status dalam keluarga</Label>
                  <Input
                    id="kd-status-keluarga"
                    value={kependudukan.statusDalamKeluarga}
                    onChange={(e) => setKependudukan((k) => ({ ...k, statusDalamKeluarga: e.target.value }))}
                  />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="kd-nomor-kk">Nomor KK</Label>
                  <Input
                    id="kd-nomor-kk"
                    value={kependudukan.nomorKk}
                    onChange={(e) => setKependudukan((k) => ({ ...k, nomorKk: e.target.value }))}
                  />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="kd-nama-ayah">Nama ayah</Label>
                  <Input
                    id="kd-nama-ayah"
                    value={kependudukan.namaAyah}
                    onChange={(e) => setKependudukan((k) => ({ ...k, namaAyah: e.target.value }))}
                  />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="kd-nama-ibu">Nama ibu</Label>
                  <Input
                    id="kd-nama-ibu"
                    value={kependudukan.namaIbu}
                    onChange={(e) => setKependudukan((k) => ({ ...k, namaIbu: e.target.value }))}
                  />
                </div>
                <div className="min-w-0 sm:col-span-2 lg:col-span-3">
                  <Label htmlFor="kd-alamat">Alamat lengkap</Label>
                  <Input
                    id="kd-alamat"
                    value={kependudukan.alamatLengkap}
                    onChange={(e) => setKependudukan((k) => ({ ...k, alamatLengkap: e.target.value }))}
                  />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="kd-rt-rw">RT/RW</Label>
                  <Input
                    id="kd-rt-rw"
                    value={kependudukan.rtRw}
                    onChange={(e) => setKependudukan((k) => ({ ...k, rtRw: e.target.value }))}
                  />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="kd-kode-pos">Kode pos</Label>
                  <Input
                    id="kd-kode-pos"
                    value={kependudukan.kodePos}
                    onChange={(e) => setKependudukan((k) => ({ ...k, kodePos: e.target.value }))}
                  />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="kd-desa">Desa/Kelurahan</Label>
                  <Input
                    id="kd-desa"
                    value={kependudukan.desaKelurahan}
                    onChange={(e) => setKependudukan((k) => ({ ...k, desaKelurahan: e.target.value }))}
                  />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="kd-kecamatan">Kecamatan</Label>
                  <Input
                    id="kd-kecamatan"
                    value={kependudukan.kecamatan}
                    onChange={(e) => setKependudukan((k) => ({ ...k, kecamatan: e.target.value }))}
                  />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="kd-kabupaten">Kabupaten/Kota</Label>
                  <Input
                    id="kd-kabupaten"
                    value={kependudukan.kabupatenKota}
                    onChange={(e) => setKependudukan((k) => ({ ...k, kabupatenKota: e.target.value }))}
                  />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="kd-provinsi">Provinsi</Label>
                  <Input
                    id="kd-provinsi"
                    value={kependudukan.provinsi}
                    onChange={(e) => setKependudukan((k) => ({ ...k, provinsi: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <Button type="submit" loading={createMutation.isPending} className="w-full sm:w-auto">
              Tambah Santri
            </Button>
          </form>
        </CardBody>
      </Card>
      )}

      <div className="mb-3 flex min-w-0 flex-wrap items-center gap-2">
        <Label htmlFor="filter-status" className="mb-0 shrink-0">
          Filter status
        </Label>
        <Select id="filter-status" className="w-full min-w-0 sm:w-auto" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="semua">Semua</option>
          <option value="aktif">Aktif</option>
          <option value="lulus">Lulus</option>
          <option value="keluar">Keluar</option>
          <option value="pindah">Pindah</option>
        </Select>
      </div>

      <Card>
        <CardBody>
          {deleteMutation.isError && (
            <div className="mb-3">
              <ErrorNotice
                message={deleteMutation.error instanceof ApiError ? deleteMutation.error.message : 'Gagal menghapus santri.'}
              />
            </div>
          )}
          {santriQuery.isLoading ? (
            <Spinner />
          ) : (
            <DataTable columns={columns} rows={santriQuery.data ?? []} rowKey={(s) => s.id} />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
