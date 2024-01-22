import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { localMiddleware } from '../middleware/local.moddleware'
import { validateRequest } from '../middleware/validator.middleware'
import { signInSchema } from '../schemas/user/sign-in.schema'
import { signUpSchema } from '../schemas/user/sign-up.schema'
import { controllerWrapper } from '../utils/controller-wrapper.util'

export const authRouter: Router = Router()

const { signUp, signIn } = authController

authRouter.post('/sign-up', validateRequest({ body: signUpSchema }), controllerWrapper(signUp))

authRouter.post(
  '/sign-in',
  validateRequest({ body: signInSchema }),
  localMiddleware,
  controllerWrapper(signIn),
)