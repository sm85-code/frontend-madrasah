import { z } from 'zod'

export const loginSchema = z.object({
  no_hp: z.string().min(8, 'Nomor HP minimal 8 digit').max(32),
  password: z.string().min(4, 'Password minimal 4 karakter').max(72),
})

export type LoginFormValues = z.infer<typeof loginSchema>
