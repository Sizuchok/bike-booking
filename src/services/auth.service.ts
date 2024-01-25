import { StatusCodes } from 'http-status-codes'
import { Collection, ObjectId } from 'mongodb'
import { MONGO } from '../const/mongodb-key.const'
import { client } from '../db/config'
import { HttpError } from '../error/http-error'
import { SignUp, User, UserForMongo } from '../types/user.types'
import { cryptoService } from './hashing/crypto.service'
import { jwtService } from './jwt.service'

export class AuthService {
  constructor(private collection: Collection<UserForMongo>) {}

  signUp = async (credentials: SignUp) => {
    const user = await this.collection.findOne({ email: credentials.email })

    if (user) {
      throw new HttpError(StatusCodes.CONFLICT, 'This email is already associated with an account.')
    }

    const hashedPwd = await cryptoService.hash(credentials.password)

    await this.collection.insertOne({ ...credentials, password: hashedPwd })
  }

  findOneById = async (id: string) => {
    return this.collection.findOne({ _id: new ObjectId(id) })
  }

  findOneOmitPassword = async (id: string) => {
    return this.collection.findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } })
  }

  findOneByEmail = async (email: string) => {
    return this.collection.findOne({ email })
  }

  signInWithJwt = (user: User) => {
    const jwt = jwtService.issue({
      sub: user._id.toString(),
      ttl: 60,
    })

    return jwt
  }
}

export const authService = new AuthService(
  client.db(MONGO.DB_NAME).collection(MONGO.COLLECTIONS.USERS),
)
