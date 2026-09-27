import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createKegiatan, deleteKegiatan, updatePengaturan } from '../../api/admin'
import { getKegiatan, getPengaturan } from '../../api/public'
import { ApiError } from '../../lib/apiClient'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/AppCard'
import { DeleteRowButton } from '../../components/ui/DeleteRowButton'
import { ErrorNotice, Spinner, SuccessNotice } from '../../components/ui/Feedback'
import { Input, Label, Textarea } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Pengaturan } from '../../types'

/** Mounted only once `pengaturan` has loaded (see the `isLoading` gate
 * below), so its form state can be initialized straight from the fetched
 * row -- no effect needed to copy query data into state after the fact. */
function IdentitasPsbForm({ pengaturan }: { pengaturan: Pengaturan }) {
  const queryClient = useQueryClient()
  const [namaSekolah, setNamaSekolah] = useState(pengaturan.nama_sekolah)
  const [tagline, setTagline] = useState(pengaturan.tagline)
  const [alamat, setAlamat] = useState(pengaturan.alamat)
  const [infoPsb, setInfoPsb] = useState(pengaturan.info_psb)
  const [kontakPsb, setKontakPsb] = useState(pengaturan.kontak_psb)

  const pengaturanMutation = useMutation({
    mutationFn: () =>
      updatePengaturan({ nama_sekolah: namaSekolah, tagline, alamat, info_psb: infoPsb, kontak_psb: kontakPsb }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengaturan'] })
    },
  })

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        pengaturanMutation.mutate()
      }}
    >
      <div>
        <Label htmlFor="nama-sekolah">Nama sekolah</Label>
        <Input id="nama-sekolah" value={namaSekolah} onChange={(e) => setNamaSekolah(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="tagline">Tagline</Label>
        <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="alamat">Alamat</Label>
        <Textarea id="alamat" rows={2} value={alamat} onChange={(e) => setAlamat(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="kontak-psb">Kontak PSB (nomor WA/telepon)</Label>
        <Input id="kontak-psb" placeholder="0812xxxxxxxx" value={kontakPsb} onChange={(e) => setKontakPsb(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="info-psb">Info PSB (syarat, jadwal, biaya)</Label>
        <Textarea
          id="info-psb"
          rows={6}
          placeholder={'Contoh:\nSyarat: fotokopi KK, akta lahir, pas foto 3x4.\nJadwal: Januari - Juni 2026.\nBiaya pendaftaran: Rp 100.000.'}
          value={infoPsb}
          onChange={(e) => setInfoPsb(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">Tampil apa adanya (baris baru dipertahankan) di section PSB landing page.</p>
      </div>

      {pengaturanMutation.isError && (
        <ErrorNotice
          message={pengaturanMutation.error instanceof ApiError ? pengaturanMutation.error.message : 'Gagal menyimpan pengaturan.'}
        />
      )}
      {pengaturanMutation.isSuccess && <SuccessNotice message="Pengaturan tersimpan." />}

      <Button type="submit" loading={pengaturanMutation.isPending}>
        Simpan
      </Button>
    </form>
  )
}

export function AdminPengaturanPage() {
  const queryClient = useQueryClient()
  const pengaturanQuery = useQuery({ queryKey: ['pengaturan'], queryFn: getPengaturan })
  const kegiatanQuery = useQuery({ queryKey: ['kegiatan-publik'], queryFn: getKegiatan })

  const [judulKegiatan, setJudulKegiatan] = useState('')
  const [deskripsiKegiatan, setDeskripsiKegiatan] = useState('')

  const createKegiatanMutation = useMutation({
    mutationFn: () => createKegiatan({ judul: judulKegiatan, deskripsi: deskripsiKegiatan }),
    onSuccess: () => {
      setJudulKegiatan('')
      setDeskripsiKegiatan('')
      queryClient.invalidateQueries({ queryKey: ['kegiatan-publik'] })
    },
  })

  const deleteKegiatanMutation = useMutation({
    mutationFn: deleteKegiatan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kegiatan-publik'] }),
  })

  return (
    <div>
      <PageHeader title="Pengaturan" description="Identitas sekolah, info PSB, dan kegiatan yang tampil di halaman publik." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Identitas & PSB</CardTitle>
          </CardHeader>
          <CardBody>
            {pengaturanQuery.isLoading || !pengaturanQuery.data ? <Spinner /> : <IdentitasPsbForm pengaturan={pengaturanQuery.data} />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kegiatan & Program</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="mb-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                createKegiatanMutation.mutate()
              }}
            >
              <div>
                <Label htmlFor="judul-kegiatan">Judul</Label>
                <Input id="judul-kegiatan" placeholder="mis. Tahfidz Al-Qur'an" value={judulKegiatan} onChange={(e) => setJudulKegiatan(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="deskripsi-kegiatan">Deskripsi singkat</Label>
                <Textarea id="deskripsi-kegiatan" rows={2} value={deskripsiKegiatan} onChange={(e) => setDeskripsiKegiatan(e.target.value)} />
              </div>
              {createKegiatanMutation.isError && (
                <ErrorNotice
                  message={createKegiatanMutation.error instanceof ApiError ? createKegiatanMutation.error.message : 'Gagal menambah kegiatan.'}
                />
              )}
              <Button type="submit" loading={createKegiatanMutation.isPending}>
                Tambah Kegiatan
              </Button>
            </form>

            {kegiatanQuery.isLoading ? (
              <Spinner />
            ) : kegiatanQuery.data?.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada kegiatan.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {kegiatanQuery.data?.map((k) => (
                  <li key={k.id} className="flex items-start justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{k.judul}</p>
                      {k.deskripsi && <p className="mt-0.5 text-muted-foreground">{k.deskripsi}</p>}
                    </div>
                    <DeleteRowButton onClick={() => deleteKegiatanMutation.mutate(k.id)} label={`Hapus ${k.judul}`} itemName={k.judul} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
