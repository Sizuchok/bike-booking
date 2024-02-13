import { HttpError } from '../error/http-error'
import { AuthService } from './auth.service'
import { JwtService } from './jwt.service'

export const plainUser = {
  name: 'Test',
  email: 'test@mail.com',
  password: 'Password999',
} as const

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
})
