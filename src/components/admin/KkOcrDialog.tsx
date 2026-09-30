import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { ocrKartuKeluarga } from '../../api/admin'
import { ApiError } from '../../lib/apiClient'
import { compressImageForOcr } from '../../lib/compressImage'
import { Button } from '../ui/AppButton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { ErrorNotice } from '../ui/Feedback'
import { Label } from '../ui/AppInput'
import type { KkAnggotaKeluarga, KkOcrResult } from '../../types'

/** Upload foto Kartu Keluarga -> OCR (OCR.space, lihat
 * POST /admin/santri/kk-ocr) -> admin memilih baris anggota keluarga mana
 * yang sedang didaftarkan sebagai santri. Backend TIDAK menyimpan apa pun
 * dari langkah ini -- onPilih hanya mengisi form pendaftaran, yang masih
 * harus direview/diedit dan disubmit manual oleh admin. */
export function KkOcrDialog({ onPilih }: { onPilih: (anggota: KkAnggotaKeluarga, kk: KkOcrResult) => void }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadPercent, setUploadPercent] = useState<number | null>(null)

  const ocrMutation = useMutation({
    mutationFn: async (f: File) => {
      setUploadPercent(0)
      const compressed = await compressImageForOcr(f)
      return ocrKartuKeluarga(compressed, setUploadPercent)
    },
  })

  const reset = () => {
    setFile(null)
    setUploadPercent(null)
    ocrMutation.reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="secondary" className="w-full sm:w-auto">
          Isi dari Foto KK
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Isi dari Foto Kartu Keluarga</DialogTitle>
          <DialogDescription>
            Foto dibaca otomatis (OCR), lalu pilih anggota keluarga mana yang akan didaftarkan sebagai santri.
            Data hasil bacaan WAJIB diperiksa/diedit di form sebelum disimpan -- belum ada yang tersimpan di langkah
            ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="min-w-0">
              <Label htmlFor="kk-file-camera">Ambil foto dengan kamera</Label>
              <label
                htmlFor="kk-file-camera"
                className="flex h-9 w-full cursor-pointer items-center justify-center rounded-lg border border-input bg-transparent px-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                Buka Kamera
              </label>
              <input
                id="kk-file-camera"
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null)
                  ocrMutation.reset()
                }}
              />
            </div>
            <div className="min-w-0">
              <Label htmlFor="kk-file-gallery">Ambil foto dari galeri/penyimpanan</Label>
              <label
                htmlFor="kk-file-gallery"
                className="flex h-9 w-full cursor-pointer items-center justify-center rounded-lg border border-input bg-transparent px-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                Pilih dari Galeri
              </label>
              <input
                id="kk-file-gallery"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null)
                  ocrMutation.reset()
                }}
              />
            </div>
          </div>

          {file && (
            <p className="truncate text-xs text-muted-foreground">Foto dipilih: {file.name}</p>
          )}

          {ocrMutation.isError && (
            <ErrorNotice
              message={
                ocrMutation.error instanceof ApiError
                  ? ocrMutation.error.message
                  : 'Gagal membaca foto KK -- kemungkinan koneksi internet terputus/lambat saat upload. Coba lagi, atau periksa sinyal internet.'
              }
            />
          )}

          {!ocrMutation.data && (
            <>
              {ocrMutation.isPending && uploadPercent !== null && (
                <p className="text-xs text-muted-foreground">
                  {uploadPercent < 100 ? `Mengupload foto... ${uploadPercent}%` : 'Membaca foto (OCR)...'}
                </p>
              )}
              <Button
                type="button"
                className="w-full"
                loading={ocrMutation.isPending}
                disabled={!file}
                onClick={() => file && ocrMutation.mutate(file)}
              >
                Baca Foto
              </Button>
            </>
          )}

          {ocrMutation.data && (
            <div className="space-y-2">
              {ocrMutation.data.anggota.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Tidak ada anggota keluarga yang terbaca. Coba foto ulang dengan pencahayaan lebih baik, atau isi
                  form secara manual.
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Pilih baris yang sesuai santri yang didaftarkan:</p>
                  <div className="max-h-64 space-y-1.5 overflow-y-auto">
                    {ocrMutation.data.anggota.map((a) => (
                      <button
                        key={a.baris}
                        type="button"
                        className="w-full rounded-md border border-border p-2 text-left text-sm hover:bg-accent"
                        onClick={() => {
                          onPilih(a, ocrMutation.data!)
                          setOpen(false)
                          reset()
                        }}
                      >
                        <div className="font-medium">
                          {a.baris}. {a.nama || '(nama tidak terbaca)'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {[a.status_dalam_keluarga, a.nik, a.tanggal_lahir].filter(Boolean).join(' · ') || 'Data lain tidak terbaca'}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
