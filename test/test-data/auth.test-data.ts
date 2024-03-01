import { ObjectId } from 'mongodb'
import { CryptoService } from '../../src/services/hashing/crypto.service'
import { JwtService } from '../../src/services/jwt.service'
import { User } from '../../src/types/user.types'

const _id = new ObjectId()

const jwtService = new JwtService(process.dotEnv.JWT_SECRET_KEY)
const cryptoService = new CryptoService()

export const NE_ACCESS_TOKEN = jwtService.issue({ sub: _id.toHexString(), ttl: 315360000 })
export const E_ACCESS_TOKEN = jwtService.issue({ sub: _id.toHexString(), ttl: 0 })

export const NE_REFRESH_TOKEN = jwtService.issue(
  { sub: _id.toHexString(), ttl: 315360000 },
  process.dotEnv.REFRESH_JWT_SECRET_KEY,
)
export const E_REFRESH_TOKEN = jwtService.issue(
  { sub: _id.toHexString(), ttl: 0 },
  process.dotEnv.REFRESH_JWT_SECRET_KEY,
)

const plainUserPwd = 'Password123' as const
const plainUserEmail = 'test@mail.com' as const

export const fixtureUser: User = {
  _id,
  name: 'Test',
  email: plainUserEmail,
  password: await cryptoService.hash(plainUserPwd),
  refreshTokens: [E_REFRESH_TOKEN, NE_REFRESH_TOKEN],
} as const

export const plainUser = {
  name: 'Test',
  email: plainUserEmail,
  password: plainUserPwd,
} as const
