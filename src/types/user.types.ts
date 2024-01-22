import { z } from 'zod'
import { signInSchema } from '../schemas/user/sign-in.schema'
import { signUpSchema } from '../schemas/user/sign-up.schema'
import { MongoId } from './common.types'

export type User = MongoId & SignUp
export type UserForMongo = Omit<User, '_id'>

export type SignUp = z.infer<typeof signUpSchema>

export type SignIn = z.infer<typeof signInSchema>
