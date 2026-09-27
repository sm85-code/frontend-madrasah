import { useMutation, useQuery } from '@tanstack/react-query'
import { GraduationCap, Phone, Send } from 'lucide-react'
import { useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { getPengaturan, listUnitPublik, submitPendaftaran } from '../api/public'
import { ApiError } from '../lib/apiClient'
import { AppearancePopover } from '../components/AppearancePopover'
import { Card, CardBody } from '../components/ui/AppCard'
import { Button } from '../components/ui/AppButton'
import { ErrorNotice, Spinner, SuccessNotice } from '../components/ui/Feedback'
import { Input, Label, Select, Textarea } from '../components/ui/AppInput'

function waLink(kontak: string) {
  const digits = kontak.replace(/[^0-9]/g, '')
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  return `https://wa.me/${normalized}`
}

export function PublicPendaftaranPage() {
  const { data: pengaturan } = useQuery({ queryKey: ['pengaturan'], queryFn: getPengaturan })
  const unitQuery = useQuery({ queryKey: ['unit-publik'], queryFn: listUnitPublik })
  const infoPsb = pengaturan?.info_psb?.trim()
  const kontakPsb = pengaturan?.kontak_psb?.trim()
  const [form, setForm] = useState({
    nama_calon: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    nama_orang_tua: '',
    no_hp: '',
    alamat: '',
    asal_sekolah: '',
    catatan: '',
    madrasah_unit_id: '',
  })

  const mutation = useMutation({
    mutationFn: () => submitPendaftaran(form),
    onSuccess: () => {
      setForm({
        nama_calon: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        nama_orang_tua: '',
        no_hp: '',
        alamat: '',
        asal_sekolah: '',
        catatan: '',
        madrasah_unit_id: '',
      })
    },
  })

  const set = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 shadow-soft backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-4.5" strokeWidth={2.25} />
            </span>
            <p className="truncate font-semibold text-foreground">{pengaturan?.nama_sekolah ?? 'Madrasah'}</p>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Link to="/" className="hidden px-2 text-sm text-muted-foreground hover:text-foreground sm:inline">
              Beranda
            </Link>
            <AppearancePopover />
            <Link to="/login">
              <Button size="sm">Masuk</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <h1 className="text-2xl font-semibold text-foreground">Pendaftaran Santri Baru</h1>
        <p className="mt-2 text-sm text-muted-foreground">Isi data di bawah, panitia PSB akan menghubungi Anda.</p>

        {infoPsb && (
          <Card className="mt-6 shadow-soft">
            <CardBody>
              <p className="whitespace-pre-line text-sm text-foreground">{infoPsb}</p>
              {kontakPsb && (
                <a
                  href={waLink(kontakPsb)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <Phone className="size-4" strokeWidth={2} />
                  Hubungi Panitia PSB: {kontakPsb}
                </a>
              )}
            </CardBody>
          </Card>
        )}

        <div className="mt-8">
          {mutation.isSuccess ? (
            <Card className="shadow-soft">
              <CardBody className="flex flex-col items-center gap-2 py-10 text-center">
                <SuccessNotice message="Pendaftaran berhasil dikirim. Kami akan menghubungi Anda segera." />
                <Button variant="secondary" onClick={() => mutation.reset()} className="mt-2">
                  Daftarkan Calon Lain
                </Button>
              </CardBody>
            </Card>
          ) : (
            <Card className="shadow-soft">
              <CardBody>
                {unitQuery.isLoading ? (
                  <Spinner />
                ) : (
                  <form
                    className="grid gap-3 sm:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      mutation.mutate()
                    }}
                  >
                    <div>
                      <Label htmlFor="nama_calon">Nama calon santri</Label>
                      <Input id="nama_calon" value={form.nama_calon} onChange={set('nama_calon')} required />
                    </div>
                    <div>
                      <Label htmlFor="nama_orang_tua">Nama orang tua/wali</Label>
                      <Input id="nama_orang_tua" value={form.nama_orang_tua} onChange={set('nama_orang_tua')} required />
                    </div>
                    <div>
                      <Label htmlFor="tempat_lahir">Tempat lahir</Label>
                      <Input id="tempat_lahir" value={form.tempat_lahir} onChange={set('tempat_lahir')} />
                    </div>
                    <div>
                      <Label htmlFor="tanggal_lahir">Tanggal lahir</Label>
                      <Input id="tanggal_lahir" type="date" value={form.tanggal_lahir} onChange={set('tanggal_lahir')} />
                    </div>
                    <div>
                      <Label htmlFor="no_hp">No. HP/WhatsApp aktif</Label>
                      <Input id="no_hp" placeholder="0812xxxxxxxx" value={form.no_hp} onChange={set('no_hp')} required />
                    </div>
                    <div>
                      <Label htmlFor="asal_sekolah">Asal sekolah (jika ada)</Label>
                      <Input id="asal_sekolah" value={form.asal_sekolah} onChange={set('asal_sekolah')} />
                    </div>
                    <div>
                      <Label htmlFor="madrasah_unit_id">Unit / lembaga</Label>
                      <Select
                        id="madrasah_unit_id"
                        value={form.madrasah_unit_id}
                        onChange={(e) => setForm((prev) => ({ ...prev, madrasah_unit_id: e.target.value }))}
                        required
                      >
                        <option value="">Pilih unit</option>
                        {unitQuery.data?.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.nama}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="alamat">Alamat</Label>
                      <Textarea id="alamat" rows={2} value={form.alamat} onChange={set('alamat')} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="catatan">Catatan (opsional)</Label>
                      <Textarea id="catatan" rows={2} value={form.catatan} onChange={set('catatan')} />
                    </div>
                    {mutation.isError && (
                      <div className="sm:col-span-2">
                        <ErrorNotice
                          message={
                            mutation.error instanceof ApiError ? mutation.error.message : 'Gagal mengirim pendaftaran, coba lagi.'
                          }
                        />
                      </div>
                    )}
                    <Button type="submit" loading={mutation.isPending} className="sm:col-span-2 sm:w-fit">
                      <Send className="size-4" strokeWidth={2} />
                      Kirim Pendaftaran
                    </Button>
                  </form>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
