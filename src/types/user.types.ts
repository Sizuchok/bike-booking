import { z } from 'zod'
import { signInSchema } from '../schemas/user/sign-in.schema'
import { signUpSchema } from '../schemas/user/sign-up.schema'
import { Bike } from './bike.types'
import { MongoId } from './common.types'

export type User = MongoId &
  SignUp & {
    refreshTokens: string[]
    bikes?: Bike[] | null
    booked?: Bike[] | null
  }
export type UserForMongo = Omit<User, '_id'>

export type SignUp = z.infer<typeof signUpSchema>

export type SignIn = z.infer<typeof signInSchema>
