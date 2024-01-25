import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ACCESS_TOKEN } from '../const/keys/common-keys.const'
import { AuthService, authService } from '../services/auth.service'
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

  signInJwt = async (req: Request<{}, {}, SignIn>, res: Response) => {
    const user = req.user!
    const { password, ...rest } = user
    const jwt = authService.signInWithJwt(user)

    res.cookie(ACCESS_TOKEN, jwt, {
      httpOnly: true,
    })

    res.json(rest)
  }
}

export const authController = new AuthController(authService)
