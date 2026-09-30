import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { patchSantri } from '../../api/admin'
import { ApiError } from '../../lib/apiClient'
import { Button } from '../ui/AppButton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { ErrorNotice } from '../ui/Feedback'
import { Input, Label, Select } from '../ui/AppInput'
import type { Santri } from '../../types'

const AGAMA_OPTIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu', 'Kepercayaan']

interface EditState {
  nama: string
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

function stateFromSantri(s: Santri): EditState {
  return {
    nama: s.nama,
    nik: s.nik ?? '',
    tempatLahir: s.tempat_lahir ?? '',
    tanggalLahir: s.tanggal_lahir ?? '',
    jenisKelamin: s.jenis_kelamin ?? '',
    agama: s.agama ?? '',
    statusDalamKeluarga: s.status_dalam_keluarga ?? '',
    alamatLengkap: s.alamat_lengkap ?? '',
    nomorKk: s.nomor_kk ?? '',
    namaAyah: s.nama_ayah ?? '',
    namaIbu: s.nama_ibu ?? '',
    rtRw: s.rt_rw ?? '',
    kodePos: s.kode_pos ?? '',
    desaKelurahan: s.desa_kelurahan ?? '',
    kecamatan: s.kecamatan ?? '',
    kabupatenKota: s.kabupaten_kota ?? '',
    provinsi: s.provinsi ?? '',
  }
}

/** Dialog untuk melihat & mengedit data kependudukan santri yang sudah
 * tersimpan (mis. hasil OCR KK saat pendaftaran) -- form tambah santri di
 * AdminSantriPage hanya dipakai sekali saat pendaftaran, jadi tanpa dialog
 * ini data itu tidak pernah bisa dilihat/diperbaiki lagi setelah disimpan. */
export function EditSantriDialog({ santri, onClose }: { santri: Santri; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<EditState>(() => stateFromSantri(santri))

  const patchMutation = useMutation({
    mutationFn: () =>
      patchSantri(santri.id, {
        nama: state.nama,
        nik: state.nik || null,
        tempat_lahir: state.tempatLahir || null,
        tanggal_lahir: state.tanggalLahir || null,
        jenis_kelamin: state.jenisKelamin || null,
        agama: state.agama || null,
        status_dalam_keluarga: state.statusDalamKeluarga || null,
        alamat_lengkap: state.alamatLengkap || null,
        nomor_kk: state.nomorKk || null,
        nama_ayah: state.namaAyah || null,
        nama_ibu: state.namaIbu || null,
        rt_rw: state.rtRw || null,
        kode_pos: state.kodePos || null,
        desa_kelurahan: state.desaKelurahan || null,
        kecamatan: state.kecamatan || null,
        kabupaten_kota: state.kabupatenKota || null,
        provinsi: state.provinsi || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'santri'] })
      onClose()
    },
  })

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Data Santri</DialogTitle>
          <DialogDescription>Lihat dan perbaiki data santri, termasuk data kependudukan hasil OCR KK.</DialogDescription>
        </DialogHeader>

        {patchMutation.isError && (
          <ErrorNotice
            message={patchMutation.error instanceof ApiError ? patchMutation.error.message : 'Gagal menyimpan perubahan.'}
          />
        )}

        <form
          className="max-h-[70vh] space-y-4 overflow-y-auto"
          onSubmit={(e) => {
            e.preventDefault()
            patchMutation.mutate()
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="min-w-0 sm:col-span-2 lg:col-span-3">
              <Label htmlFor="edit-nama">Nama santri</Label>
              <Input id="edit-nama" value={state.nama} onChange={(e) => setState((s) => ({ ...s, nama: e.target.value }))} required />
            </div>
            <div className="min-w-0">
              <Label htmlFor="edit-nik">NIK</Label>
              <Input id="edit-nik" value={state.nik} onChange={(e) => setState((s) => ({ ...s, nik: e.target.value }))} />
            </div>
            <div className="min-w-0">
              <Label htmlFor="edit-tempat-lahir">Tempat lahir</Label>
              <Input
                id="edit-tempat-lahir"
                value={state.tempatLahir}
                onChange={(e) => setState((s) => ({ ...s, tempatLahir: e.target.value }))}
              />
            </div>
            <div className="min-w-0">
              <Label htmlFor="edit-tanggal-lahir">Tanggal lahir</Label>
              <Input
                id="edit-tanggal-lahir"
                type="date"
                value={state.tanggalLahir}
                onChange={(e) => setState((s) => ({ ...s, tanggalLahir: e.target.value }))}
              />
            </div>
            <div className="min-w-0">
              <Label htmlFor="edit-jenis-kelamin">Jenis kelamin</Label>
              <Select
                id="edit-jenis-kelamin"
                value={state.jenisKelamin}
                onChange={(e) => setState((s) => ({ ...s, jenisKelamin: e.target.value as EditState['jenisKelamin'] }))}
              >
                <option value="">-</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </Select>
            </div>
            <div className="min-w-0">
              <Label htmlFor="edit-agama">Agama</Label>
              <Select id="edit-agama" value={state.agama} onChange={(e) => setState((s) => ({ ...s, agama: e.target.value }))}>
                <option value="">-</option>
                {AGAMA_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
            </div>
            <div className="min-w-0">
              <Label htmlFor="edit-status-keluarga">Status dalam keluarga</Label>
              <Input
                id="edit-status-keluarga"
                value={state.statusDalamKeluarga}
                onChange={(e) => setState((s) => ({ ...s, statusDalamKeluarga: e.target.value }))}
              />
            </div>
            <div className="min-w-0">
              <Label htmlFor="edit-nomor-kk">Nomor KK</Label>
              <Input id="edit-nomor-kk" value={state.nomorKk} onChange={(e) => setState((s) => ({ ...s, nomorKk: e.target.value }))} />
            </div>
            <div className="min-w-0">
              <Label htmlFor="edit-nama-ayah">Nama ayah</Label>
              <Input
                id="edit-nama-ayah"
                value={state.namaAyah}
                onChange={(e) => setState((s) => ({ ...s, namaAyah: e.target.value }))}
              />
            </div>
            <div className="min-w-0">
              <Label htmlFor="edit-nama-ibu">Nama ibu</Label>
              <Input id="edit-nama-ibu" value={state.namaIbu} onChange={(e) => setState((s) => ({ ...s, namaIbu: e.target.value }))} />
            </div>
            <div className="min-w-0 sm:col-span-2 lg:col-span-3">
              <Label htmlFor="edit-alamat">Alamat lengkap</Label>
              <Input
                id="edit-alamat"
                value={state.alamatLengkap}
                onChange={(e) => setState((s) => ({ ...s, alamatLengkap: e.target.value }))}
              />
            </div>
            <div className="min-w-0">
              <Label htmlFor="edit-rt-rw">RT/RW</Label>
              <Input id="edit-rt-rw" value={state.rtRw} onChange={(e) => setState((s) => ({ ...s, rtRw: e.target.value }))} />
            </div>
            <div className="min-w-0">
              <Label htmlFor="edit-kode-pos">Kode pos</Label>
              <Input id="edit-kode-pos" value={state.kodePos} onChange={(e) => setState((s) => ({ ...s, kodePos: e.target.value }))} />
            </div>
            <div className="min-w-0">
              <Label htmlFor="edit-desa">Desa/Kelurahan</Label>
              <Input
                id="edit-desa"
                value={state.desaKelurahan}
                onChange={(e) => setState((s) => ({ ...s, desaKelurahan: e.target.value }))}
              />
            </div>
            <div className="min-w-0">
              <Label htmlFor="edit-kecamatan">Kecamatan</Label>
              <Input id="edit-kecamatan" value={state.kecamatan} onChange={(e) => setState((s) => ({ ...s, kecamatan: e.target.value }))} />
            </div>
            <div className="min-w-0">
              <Label htmlFor="edit-kabupaten">Kabupaten/Kota</Label>
              <Input
                id="edit-kabupaten"
                value={state.kabupatenKota}
                onChange={(e) => setState((s) => ({ ...s, kabupatenKota: e.target.value }))}
              />
            </div>
            <div className="min-w-0">
              <Label htmlFor="edit-provinsi">Provinsi</Label>
              <Input id="edit-provinsi" value={state.provinsi} onChange={(e) => setState((s) => ({ ...s, provinsi: e.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" loading={patchMutation.isPending}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
