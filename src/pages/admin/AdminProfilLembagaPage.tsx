import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { updatePengaturan } from '../../api/admin'
import { getPengaturan } from '../../api/public'
import { ApiError } from '../../lib/apiClient'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/AppCard'
import { ErrorNotice, Spinner, SuccessNotice } from '../../components/ui/Feedback'
import { Input, Label, Textarea } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Pengaturan } from '../../types'

/** Mounted only once `pengaturan` has loaded (see the `isLoading` gate
 * below), so its form state can be initialized straight from the fetched
 * row -- no effect needed to copy query data into state after the fact. */
function ProfilLembagaForm({ pengaturan }: { pengaturan: Pengaturan }) {
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
          message={pengaturanMutation.error instanceof ApiError ? pengaturanMutation.error.message : 'Gagal menyimpan profil lembaga.'}
        />
      )}
      {pengaturanMutation.isSuccess && <SuccessNotice message="Profil lembaga tersimpan." />}

      <Button type="submit" loading={pengaturanMutation.isPending}>
        Simpan
      </Button>
    </form>
  )
}

export function AdminProfilLembagaPage() {
  const pengaturanQuery = useQuery({ queryKey: ['pengaturan'], queryFn: getPengaturan })

  return (
    <div>
      <PageHeader title="Profil Lembaga" description="Identitas madrasah dan info PSB yang tampil di halaman publik." />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Identitas & PSB</CardTitle>
        </CardHeader>
        <CardBody>
          {pengaturanQuery.isLoading || !pengaturanQuery.data ? <Spinner /> : <ProfilLembagaForm pengaturan={pengaturanQuery.data} />}
        </CardBody>
      </Card>
    </div>
  )
}
