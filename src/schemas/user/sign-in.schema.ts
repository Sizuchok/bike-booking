import { signUpSchema } from './sign-up.schema'

export const signInSchema = signUpSchema.omit({ name: true })
