import { StatusCodes } from 'http-status-codes'
import { Collection, ObjectId } from 'mongodb'
import { MONGO } from '../const/mongodb-key.const'
import { client } from '../db/config'
import { HttpError } from '../error/http-error'
import { dotEnv } from '../types/global/process-env.types'
import { SignUp, User, UserForMongo } from '../types/user.types'
import { cryptoService } from './hashing/crypto.service'
import { jwtService } from './jwt.service'

export type TokenPair = {
  accessToken: string
  refreshToken: string
}

export type TokensAndUser = {
  tokens: TokenPair
  user: User
}

export class AuthService {
  constructor(private collection: Collection<UserForMongo>) {}

  signUp = async (credentials: SignUp) => {
    const user = await this.collection.findOne({ email: credentials.email })

    if (user) {
      throw new HttpError(StatusCodes.CONFLICT, 'This email is already associated with an account.')
    }

    const hashedPwd = await cryptoService.hash(credentials.password)

    await this.collection.insertOne({ ...credentials, password: hashedPwd } as User)
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

  private issueTokens = async ({ _id }: User): Promise<TokensAndUser> => {
    const id = _id.toString()

    const accessToken = jwtService.issue({
      sub: id,
      ttl: +dotEnv.JWT_TTL,
    })

    const refreshToken = jwtService.issue(
      {
        sub: id,
        ttl: +dotEnv.REFRESH_JWT_TTL,
      },
      dotEnv.REFRESH_JWT_SECRET_KEY,
    )

    const user = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $push: {
          refreshTokens: refreshToken,
        },
      },
      {
        returnDocument: 'after',
        projection: { password: 0, refreshTokens: 0 },
      },
    )

    if (!user) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'User not found')
    }

    return {
      tokens: { accessToken, refreshToken },
      user,
    }
  }

  signInWithJwt = async (user: User): Promise<TokensAndUser> => {
    return this.issueTokens(user)
  }

  refresh = async (token: string): Promise<{ tokens: TokenPair; user: User }> => {
    jwtService.verify(token, dotEnv.REFRESH_JWT_SECRET_KEY)

    const user = await this.collection.findOneAndUpdate(
      {
        refreshTokens: token,
      },
      {
        $pull: { refreshTokens: token },
      },
      {
        returnDocument: 'after',
        projection: { password: 0, refreshTokens: 0 },
      },
    )

    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Recieved invalidated token')
    }

    return await this.issueTokens(user)
  }
}

export const authService = new AuthService(
  client.db(MONGO.DB_NAME).collection(MONGO.COLLECTIONS.USERS),
)
