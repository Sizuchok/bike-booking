import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { REFRESH_TOKEN } from '../const/keys/common-keys.const'
import { HttpError } from '../error/http-error'
import { AuthService, TokenPair, authService } from '../services/auth.service'
import { dotEnv } from '../types/global/process-env.types'
import { SignIn, SignUp, User } from '../types/user.types'

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

  private attachTokens = (res: Response, { accessToken, refreshToken }: TokenPair, user: User) => {
    res.cookie(REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      maxAge: +dotEnv.REFRESH_JWT_TTL,
    })

    res.json({ user, accessToken })
  }

  signInJwt = async (req: Request<{}, {}, SignIn>, res: Response) => {
    // TODO: REFACTOR ISSUE TOKENS METHOD
    // TO QUERY AND RETURN USER WITHOUT SENSITIVE DATA
    const user = req.user!
    const { password, refreshTokens, ...rest } = user
    const tokens = await authService.signInWithJwt(user)

    this.attachTokens(res, tokens, rest as User)
  }

  refresh = async (req: Request, res: Response) => {
    const token = req.cookies[REFRESH_TOKEN]

    if (!token) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Token missing')
    }

    try {
      const { tokens, user } = await this.authService.refresh(token)

      this.attachTokens(res, tokens, user)
    } catch (error) {
      res.clearCookie(REFRESH_TOKEN, { httpOnly: true })

      throw error
    }
  }
}

export const authController = new AuthController(authService)
