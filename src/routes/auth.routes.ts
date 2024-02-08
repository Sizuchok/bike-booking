import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { jwtAuth } from '../middleware/jwt.middleware'
import { localMiddlewareNoSession } from '../middleware/local.moddleware'
import { validateRequest } from '../middleware/validator.middleware'
import { signInSchema } from '../schemas/user/sign-in.schema'
import { signUpSchema } from '../schemas/user/sign-up.schema'
import { controllerWrapper } from '../utils/controller-wrapper.util'

export const authRouter: Router = Router()

const { signUp, signIn, signInJwt, refresh, signOut } = authController

authRouter.post('/sign-up', validateRequest({ body: signUpSchema }), controllerWrapper(signUp))

// authRouter.post(
//   '/sign-in',
//   validateRequest({ body: signInSchema }),
//   localMiddleware,
//   controllerWrapper(signIn),
// )

authRouter.post(
  '/sign-in-jwt',
  validateRequest({ body: signInSchema }),
  localMiddlewareNoSession,
  controllerWrapper(signInJwt),
)

authRouter.post('/sign-out', jwtAuth, controllerWrapper(signOut))

authRouter.get('/refresh', controllerWrapper(refresh))
