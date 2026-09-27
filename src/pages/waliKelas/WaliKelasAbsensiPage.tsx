import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { listRombelScoped } from '../../api/shared'
import { apiClient } from '../../lib/apiClient'
import { Card, CardBody } from '../../components/ui/AppCard'
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
            ) : !rekapQuery.data?.length ? (
              <p className="text-sm text-muted-foreground">Belum ada absensi mapel untuk rombel ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 font-medium">Santri</th>
                      <th className="py-2 font-medium">Sesi</th>
                      <th className="py-2 font-medium">Hadir</th>
                      <th className="py-2 font-medium">Sakit</th>
                      <th className="py-2 font-medium">Izin</th>
                      <th className="py-2 font-medium">Alpa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekapQuery.data.map((row) => (
                      <tr key={row.santri_id} className="border-b border-border last:border-0">
                        <td className="py-2 text-foreground">{row.nama}</td>
                        <td className="py-2">{row.sesi}</td>
                        <td className="py-2">{row.hadir}</td>
                        <td className="py-2">{row.sakit}</td>
                        <td className="py-2">{row.izin}</td>
                        <td className="py-2">{row.alpa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
