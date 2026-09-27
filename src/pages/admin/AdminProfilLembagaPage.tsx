import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { listUnit, patchUnit } from '../../api/yayasan'
import { ApiError } from '../../lib/apiClient'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/AppCard'
import { ErrorNotice, Spinner, SuccessNotice } from '../../components/ui/Feedback'
import { Input, Label, Textarea } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import { PROFIL_LEMBAGA_WRITE_ROLES } from '../../config/roles'
import { useCanWrite } from '../../hooks/useCanWrite'
import { useAuthStore } from '../../store/authStore'
import { useUnitStore } from '../../store/unitStore'
import type { MadrasahUnit } from '../../types'

function UnitProfilForm({ unit, writable }: { unit: MadrasahUnit; writable: boolean }) {
  const queryClient = useQueryClient()
  const [nama, setNama] = useState(unit.nama)
  const [alamat, setAlamat] = useState(unit.alamat)
  const mutation = useMutation({
    mutationFn: () => patchUnit(unit.id, { nama, alamat }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['yayasan', 'unit'] }),
  })

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate()
      }}
    >
      <div>
        <Label htmlFor={`nama-unit-${unit.id}`}>Nama lembaga</Label>
        <Input id={`nama-unit-${unit.id}`} value={nama} onChange={(e) => setNama(e.target.value)} disabled={!writable} required />
      </div>
      <div>
        <Label htmlFor={`alamat-unit-${unit.id}`}>Alamat</Label>
        <Textarea id={`alamat-unit-${unit.id}`} rows={2} value={alamat} onChange={(e) => setAlamat(e.target.value)} disabled={!writable} />
      </div>
      {mutation.isError && (
        <ErrorNotice message={mutation.error instanceof ApiError ? mutation.error.message : 'Gagal menyimpan profil lembaga.'} />
      )}
      {mutation.isSuccess && <SuccessNotice message="Profil lembaga tersimpan." />}
      {writable && (
        <Button type="submit" loading={mutation.isPending}>
          Simpan
        </Button>
      )}
    </form>
  )
}

export function AdminProfilLembagaPage() {
  const writable = useCanWrite(PROFIL_LEMBAGA_WRITE_ROLES)
  const role = useAuthStore((s) => s.user?.role)
  const selectedUnitId = useUnitStore((s) => s.selectedUnitId)
  const lintasUnit = role === 'admin' || role === 'yayasan_admin'
  const unitQuery = useQuery({ queryKey: ['yayasan', 'unit'], queryFn: listUnit })
  const units = (unitQuery.data ?? []).filter(
    (u) => !lintasUnit || !selectedUnitId || selectedUnitId === '__yayasan__' || u.id === selectedUnitId,
  )

  return (
    <div>
      <PageHeader title="Profil Lembaga" description="Identitas tiap unit. Terpisah dari Profil Yayasan, Pengumuman, Kegiatan, dan PSB." />
      {unitQuery.isError ? (
        <ErrorNotice message={unitQuery.error instanceof ApiError ? unitQuery.error.message : 'Gagal memuat profil lembaga.'} />
      ) : unitQuery.isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-5">
          {units.map((unit) => (
            <Card key={unit.id} className="max-w-xl">
              <CardHeader>
                <CardTitle>{unit.nama}</CardTitle>
              </CardHeader>
              <CardBody>
                <UnitProfilForm unit={unit} writable={writable} />
              </CardBody>
            </Card>
          ))}
          {units.length === 0 && <p className="text-sm text-muted-foreground">Belum ada unit.</p>}
        </div>
      )}
    </div>
  )
}
