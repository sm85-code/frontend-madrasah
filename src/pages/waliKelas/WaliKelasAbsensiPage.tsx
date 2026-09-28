import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { listRombelScoped } from '../../api/shared'
import { apiClient } from '../../lib/apiClient'
import { Card, CardBody } from '../../components/ui/AppCard'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Spinner } from '../../components/ui/Feedback'
import { Label, Select } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'

interface RekapAbsensi {
  santri_id: string
  nama: string
  hadir: number
  sakit: number
  izin: number
  alpa: number
  sesi: number
}

async function getRekapAbsensiRombel(rombelId: string): Promise<RekapAbsensi[]> {
  const { data } = await apiClient.get<RekapAbsensi[]>('/wali-kelas/rekap-absensi', {
    params: { rombel_id: rombelId },
  })
  return data
}

const columns: Column<RekapAbsensi>[] = [
  { header: 'Santri', cell: (row) => row.nama },
  { header: 'Sesi', cell: (row) => row.sesi },
  { header: 'Hadir', cell: (row) => row.hadir },
  { header: 'Sakit', cell: (row) => row.sakit },
  { header: 'Izin', cell: (row) => row.izin },
  { header: 'Alpa', cell: (row) => row.alpa },
]

export function WaliKelasAbsensiPage() {
  const rombelQuery = useQuery({ queryKey: ['scoped', 'rombel'], queryFn: listRombelScoped })
  const [rombelId, setRombelId] = useState('')
  const rekapQuery = useQuery({
    queryKey: ['wali-kelas', 'rekap-absensi', rombelId],
    queryFn: () => getRekapAbsensiRombel(rombelId),
    enabled: !!rombelId,
  })

  return (
    <div>
      <PageHeader title="Rekap Absensi" description="Ringkasan kehadiran dari absensi mapel di rombel asuhan." />

      <Card className="mb-5">
        <CardBody>
          <div className="w-56">
            <Label htmlFor="rombel-rekap">Rombel</Label>
            <Select id="rombel-rekap" value={rombelId} onChange={(e) => setRombelId(e.target.value)}>
              <option value="">Pilih rombel</option>
              {rombelQuery.data?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {rombelId && (
        <Card>
          <CardBody>
            {rekapQuery.isLoading ? (
              <Spinner />
            ) : (
              <DataTable
                columns={columns}
                rows={rekapQuery.data ?? []}
                rowKey={(row) => row.santri_id}
                emptyMessage="Belum ada absensi mapel untuk rombel ini."
              />
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
