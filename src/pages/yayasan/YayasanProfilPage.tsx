import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getYayasan, updateYayasan } from '../../api/yayasan'
import { ApiError } from '../../lib/apiClient'
import { Button } from '../../components/ui/AppButton'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/AppCard'
import { ErrorNotice, Spinner, SuccessNotice } from '../../components/ui/Feedback'
import { Input, Label, Textarea } from '../../components/ui/AppInput'
import { PageHeader } from '../../components/ui/PageHeader'
import { YAYASAN_ROLES } from '../../config/roles'
import { useCanWrite } from '../../hooks/useCanWrite'

export function YayasanProfilPage() {
  const queryClient = useQueryClient()
  const writable = useCanWrite(YAYASAN_ROLES)
  const query = useQuery({ queryKey: ['yayasan', 'profil'], queryFn: getYayasan })
  const [nama, setNama] = useState('')
  const [alamat, setAlamat] = useState('')
  const ready = query.data

  const mutation = useMutation({
    mutationFn: () => updateYayasan({ nama: nama || ready?.nama, alamat: alamat || ready?.alamat }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['yayasan'] }),
  })

  return (
    <div>
      <PageHeader title="Profil Yayasan" description="Identitas yayasan. Bukan profil unit/lembaga." />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Yayasan</CardTitle>
        </CardHeader>
        <CardBody>
          {query.isLoading || !ready ? (
            <Spinner />
          ) : (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                mutation.mutate()
              }}
            >
              <div>
                <Label htmlFor="nama-yayasan">Nama yayasan</Label>
                <Input
                  id="nama-yayasan"
                  defaultValue={ready.nama}
                  onChange={(e) => setNama(e.target.value)}
                  disabled={!writable}
                  required
                />
              </div>
              <div>
                <Label htmlFor="alamat-yayasan">Alamat</Label>
                <Textarea
                  id="alamat-yayasan"
                  rows={3}
                  defaultValue={ready.alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  disabled={!writable}
                />
              </div>
              {mutation.isError && (
                <ErrorNotice message={mutation.error instanceof ApiError ? mutation.error.message : 'Gagal menyimpan.'} />
              )}
              {mutation.isSuccess && <SuccessNotice message="Profil yayasan tersimpan." />}
              {writable && (
                <Button type="submit" loading={mutation.isPending}>
                  Simpan
                </Button>
              )}
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
