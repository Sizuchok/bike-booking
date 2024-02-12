import { z } from 'zod'

export const signUpSchema = z.object({
  name: z.string().min(3).max(20),
  password: z.string().min(8),
  email: z.string().email(),
})
