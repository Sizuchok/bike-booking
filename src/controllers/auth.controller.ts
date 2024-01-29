import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { REFRESH_TOKEN } from '../const/keys/common-keys.const'
import { HttpError } from '../error/http-error'
import { AuthService, TokensAndUser, authService } from '../services/auth.service'
import { dotEnv } from '../types/global/process-env.types'
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
      maxAge: +dotEnv.REFRESH_JWT_TTL,
    })

    res.json({ user, accessToken })
  }

  signInJwt = async (req: Request<{}, {}, SignIn>, res: Response) => {
    const user = req.user!
    const data = await authService.signInWithJwt(user)

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
}

export const authController = new AuthController(authService)
