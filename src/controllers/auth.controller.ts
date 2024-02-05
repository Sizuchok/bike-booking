import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { REFRESH_TOKEN } from '../const/keys/common-keys.const'
import { HttpError } from '../error/http-error'
import { AuthService, TokensAndUser, authService } from '../services/auth.service'
import { SignIn, SignUp } from '../types/user.types'

export class AuthController {
  constructor(private authService: AuthService) {}

  signUp = async (req: Request<{}, {}, SignUp>, res: Response) => {
    await this.authService.signUp(req.body)
    res.status(StatusCodes.CREATED).send()
  }

  signIn = async (req: Request<{}, {}, SignIn>, res: Response) => {
    const { password, ...rest } = req.user!
    res.json({ ...rest })
  }

  private attachTokens = (res: Response, { tokens, user }: TokensAndUser) => {
    const { accessToken, refreshToken } = tokens

    res.cookie(REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      maxAge: process.dotEnv.REFRESH_JWT_TTL * 1000,
      sameSite: 'none',
      secure: true,
    })

    res.json({ user, accessToken })
  }

  signInJwt = async (req: Request<{}, {}, SignIn>, res: Response) => {
    const user = req.user!
    const data = await this.authService.signInWithJwt(user)

    this.attachTokens(res, data)
  }

  refresh = async (req: Request, res: Response) => {
    const token = req.cookies[REFRESH_TOKEN]

    if (!token) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Token missing')
    }

    try {
      const data = await this.authService.refresh(token)

      this.attachTokens(res, data)
    } catch (error) {
      res.clearCookie(REFRESH_TOKEN, { httpOnly: true })

      throw error
    }
  }

  signOut = async (req: Request, res: Response) => {
    const token = req.cookies[REFRESH_TOKEN]

    if (!token) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Refresh token is missing')
    }

    await this.authService.signOut(token)

    res.clearCookie(REFRESH_TOKEN, { httpOnly: true }).send()
  }
}

export const authController = new AuthController(authService)
