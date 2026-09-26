import { z } from 'zod'

export const loginSchema = z.object({
  // Field key ("no_hp") mengikuti backend (UserMadrasah.no_hp), tapi ini
  // sekarang username biasa -- backend tidak memvalidasi format telepon,
  // hanya string unik. Lihat LoginRequest di sm85-arch.
  no_hp: z.string().min(3, 'Username minimal 3 karakter').max(32),
  password: z.string().min(4, 'Password minimal 4 karakter').max(72),
})

export type LoginFormValues = z.infer<typeof loginSchema>
