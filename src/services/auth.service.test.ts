import { ObjectId } from 'mongodb'
import { HttpError } from '../error/http-error'
import { DotEnv } from '../types/global/process-env.types'
import { User } from '../types/user.types'
import { AuthService, TokenPair } from './auth.service'
import { JwtService } from './jwt.service'

export const plainUser = {
  name: 'Test',
  email: 'test@mail.com',
  password: 'Password999',
} as const

export const mongoUser = {
  _id: new ObjectId(),
  ...plainUser,
  refreshTokens: [],
} as User

const mongoUserProjected = {
  _id: new ObjectId(),
  email: plainUser.email,
  name: plainUser.name,
} as Omit<User, 'password' | 'refreshTokens'>

beforeAll(() => {
  const dotEnv = {
    FRONT_END_URL: 'url',
    JWT_SECRET_KEY: 'secret',
    JWT_TTL: 100,
    MONGO_DB_PASSWORD: 'pwd',
    MONGO_DB_TEST_URL: 'mongodb://test:test@test:27017/',
    MONGO_DB_URL: 'mongodb://test:test@unit:27017/',
    MONGO_DB_USER: 'user',
    PORT: 3333,
    REFRESH_JWT_SECRET_KEY: 'refresh_secret',
    REFRESH_JWT_TTL: 100,
    NODE_ENV: 'dev',
  } as DotEnv

  process.dotEnv = dotEnv
})

describe('AuthService', () => {
  describe('signUp method', () => {
    it('should create a user with valid input', async () => {
      const mockFindOne = vi.fn().mockResolvedValue(Promise.resolve(undefined))
      const mockInsertOne = vi.fn().mockResolvedValue(Promise.resolve(undefined))

      const mockUserCollection = {
        findOne: mockFindOne,
        insertOne: mockInsertOne,
      }

      const authService = new AuthService(mockUserCollection as any, {} as JwtService)

      await authService.signUp(plainUser)
      expect(mockFindOne).toHaveBeenCalledOnce()
      expect(mockInsertOne).toHaveBeenCalledOnce()
    })

    it('should throw an error telling the user is already sign-up', async () => {
      const mockFindOne = vi.fn().mockResolvedValue(Promise.resolve({}))

      const mockUserCollection = {
        findOne: mockFindOne,
      }

      const authService = new AuthService(mockUserCollection as any, {} as JwtService)

      await expect(authService.signUp(plainUser)).rejects.toThrow(HttpError)
      expect(mockFindOne).toHaveBeenCalledOnce()
    })
  })

  describe('signIn method', () => {
    it('should issue and return token pair and a user', async () => {
      const id = new ObjectId()

      const mockFindOneAndUpdate = vi.fn().mockResolvedValue(Promise.resolve(mongoUserProjected))

      const mockUserCollection = {
        findOneAndUpdate: mockFindOneAndUpdate,
      }

      const mockIssueToken = vi.fn().mockImplementation(() => 'token')

      const mockJwtService = {
        issue: mockIssueToken,
      }

      const authService = new AuthService(mockUserCollection as any, mockJwtService as any)

      const result = await authService.signIn({ _id: id } as User)

      expect(result.tokens).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      } as TokenPair)

      expect(result.user).toEqual(mongoUserProjected)
    })

    it('should throw HttpError because user was not found in for update', async () => {
      const id = new ObjectId()

      const mockFindOneAndUpdate = vi.fn().mockResolvedValue(Promise.resolve(undefined))

      const mockUserCollection = {
        findOneAndUpdate: mockFindOneAndUpdate,
      }

      const mockIssueToken = vi.fn().mockImplementation(() => 'token')

      const mockJwtService = {
        issue: mockIssueToken,
      }

      const authService = new AuthService(mockUserCollection as any, mockJwtService as any)

      await expect(authService.signIn({ _id: id } as User)).rejects.toThrow(HttpError)
    })
  })

  describe('refresh method', () => {
    it('successfully verifies a refresh and returns a new pair of tokens and a user', async () => {
      const id = new ObjectId()

      const mockFindOneAndUpdate = vi.fn().mockResolvedValue(Promise.resolve(mongoUserProjected))

      const mockUserCollection = {
        findOneAndUpdate: mockFindOneAndUpdate,
      }
      const mockIssueToken = vi.fn().mockImplementation(() => 'token')
      const mockVefifyToken = vi.fn().mockImplementation(() => {})

      const mockJwtService = {
        verify: mockVefifyToken,
        issue: mockIssueToken,
      }

      const authService = new AuthService(mockUserCollection as any, mockJwtService as any)

      const result = await authService.refresh('token')

      expect(result.tokens).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      } as TokenPair)

      expect(result.user).toEqual(mongoUserProjected)
    })
  })
})
