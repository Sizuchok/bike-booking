import { StatusCodes } from 'http-status-codes'
import { Collection, ObjectId } from 'mongodb'
import { HttpError } from '../error/http-error'
import { SignUp, User, UserForMongo } from '../types/user.types'
import { CryptoService } from './hashing/crypto.service'
import { JwtService } from './jwt.service'

export type TokenPair = {
  accessToken: string
  refreshToken: string
}

export type TokensAndUser = {
  tokens: TokenPair
  user: User
}

export class AuthService {
  private cryptoService: CryptoService = new CryptoService()
  constructor(private collection: Collection<UserForMongo>, private jwtService: JwtService) {}

  signUp = async (credentials: SignUp) => {
    const user = await this.collection.findOne({ email: credentials.email })

    if (user) {
      throw new HttpError(StatusCodes.CONFLICT, 'This email is already associated with an account.')
    }

    const hashedPwd = await this.cryptoService.hash(credentials.password)

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

    const accessToken = this.jwtService.issue({
      sub: id,
      ttl: process.dotEnv.JWT_TTL,
    })

    const refreshToken = this.jwtService.issue(
      {
        sub: id,
        ttl: process.dotEnv.REFRESH_JWT_TTL,
      },
      process.dotEnv.REFRESH_JWT_SECRET_KEY,
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

  refresh = async (token: string): Promise<TokensAndUser> => {
    try {
      this.jwtService.verify(token, process.dotEnv.REFRESH_JWT_SECRET_KEY)
    } catch (error) {
      const { message } = error as Error
      throw new HttpError(StatusCodes.UNAUTHORIZED, message)
    }

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

    return this.issueTokens(user)
  }

  signOut = async (refreshToken: string) => {
    await this.collection.updateOne(
      { refreshTokens: refreshToken },
      { $pull: { refreshTokens: refreshToken } },
    )
  }
}
