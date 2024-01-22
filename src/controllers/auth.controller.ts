import { Request, Response } from 'express'
import { AuthService, authService } from '../services/auth.service'
import { SignIn, SignUp } from '../types/user.types'

export class AuthController {
  constructor(private bikesService: AuthService) {}

  signUp = async (req: Request<{}, {}, SignUp>, res: Response) => {
    await this.bikesService.signUp(req.body)
    res.send()
  }

  signIn = async (req: Request<{}, {}, SignIn>, res: Response) => {
    const { password, ...rest } = req.user!
    res.json({ ...rest })
  }
}

export const authController = new AuthController(authService)
