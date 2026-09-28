import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { getJadwalSaya, getPenugasanSaya } from '../../api/guruMapel'
import { ApiError } from '../../lib/apiClient'
import { Card, CardBody } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { ErrorNotice, Spinner } from '../../components/ui/Feedback'
import { Label, Select } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Jadwal } from '../../types'

const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

type RombelOption = { id: string; nama: string; mapelLabels: string[] }

export function JadwalMapelPage() {
  const penugasanQuery = useQuery({ queryKey: ['guru-mapel', 'penugasan-saya'], queryFn: getPenugasanSaya })
  const [rombelId, setRombelId] = useState('')

  /** Unique rombels from penugasan (may span multiple units). */
  const rombelOptions = useMemo(() => {
    const map = new Map<string, RombelOption>()
    for (const p of penugasanQuery.data ?? []) {
      const existing = map.get(p.rombel_id)
      const mapelName = p.mapel?.trim() || 'Mapel'
      if (existing) {
        if (!existing.mapelLabels.includes(mapelName)) existing.mapelLabels.push(mapelName)
      } else {
        map.set(p.rombel_id, {
          id: p.rombel_id,
          nama: p.rombel?.trim() || p.rombel_id,
          mapelLabels: [mapelName],
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => a.nama.localeCompare(b.nama, 'id'))
  }, [penugasanQuery.data])

  const effectiveRombelId = rombelOptions.some((r) => r.id === rombelId)
    ? rombelId
    : (rombelOptions[0]?.id ?? '')

  const jadwalQuery = useQuery({
    queryKey: ['guru-mapel', 'jadwal', effectiveRombelId],
    queryFn: () => getJadwalSaya(effectiveRombelId),
    enabled: !!effectiveRombelId,
  })

  const rows = useMemo(() => {
    const list = jadwalQuery.data ?? []
    return [...list].sort((a, b) => {
      const ha = HARI_ORDER.indexOf(a.hari)
      const hb = HARI_ORDER.indexOf(b.hari)
      if (ha !== hb) return (ha === -1 ? 99 : ha) - (hb === -1 ? 99 : hb)
      return a.jam_mulai.localeCompare(b.jam_mulai)
    })
  }, [jadwalQuery.data])

  const columns: Column<Jadwal>[] = [
    { header: 'Hari', cell: (j) => j.hari },
    { header: 'Jam', cell: (j) => `${j.jam_mulai}-${j.jam_selesai}` },
    { header: 'Mapel', cell: (j) => j.mapel ?? '-' },
  ]

  return (
    <div>
      <PageHeader
        title="Jadwal"
        description="Jadwal mapel per rombel yang Anda ajar (hanya lihat)."
      />

      <Card className="mb-5">
        <CardBody>
          {penugasanQuery.isError ? (
            <ErrorNotice
              message={
                penugasanQuery.error instanceof ApiError
                  ? penugasanQuery.error.message
                  : 'Gagal memuat penugasan.'
              }
            />
          ) : penugasanQuery.isLoading ? (
            <Spinner />
          ) : rombelOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada penugasan mapel. Hubungi kurikulum untuk ditugaskan ke rombel.
            </p>
          ) : (
            <div className="w-full max-w-sm">
              <Label htmlFor="rombel-jadwal-mapel">Rombel</Label>
              <Select
                id="rombel-jadwal-mapel"
                value={effectiveRombelId}
                onChange={(e) => setRombelId(e.target.value)}
              >
                {rombelOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama}
                    {r.mapelLabels.length > 0 ? ` — ${r.mapelLabels.join(', ')}` : ''}
                  </option>
                ))}
              </Select>
              {rombelOptions.length > 1 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {rombelOptions.length} rombel dari penugasan Anda
                  (termasuk lintas unit bila ada).
                </p>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {effectiveRombelId && (
        <Card>
          <CardBody>
            {jadwalQuery.isError ? (
              <ErrorNotice
                message={
                  jadwalQuery.error instanceof ApiError
                    ? jadwalQuery.error.message
                    : 'Gagal memuat jadwal.'
                }
              />
            ) : jadwalQuery.isLoading ? (
              <Spinner />
            ) : (
              <DataTable
                columns={columns}
                rows={rows}
                rowKey={(j) => j.id}
                emptyMessage="Belum ada jadwal untuk rombel ini."
              />
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
