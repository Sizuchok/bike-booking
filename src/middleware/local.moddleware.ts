import { StatusCodes } from 'http-status-codes'
import passport from 'passport'
import { Strategy } from 'passport-local'
import { userCollection } from '../db/collections.const'
import { HttpError } from '../error/http-error'
import { AuthService } from '../services/auth.service'
import { CryptoService } from '../services/hashing/crypto.service'
import { JwtService } from '../services/jwt.service'

const LocalStrategy = new Strategy({ usernameField: 'email' }, async (email, password, done) => {
  const jwtService = new JwtService(process.dotEnv.JWT_SECRET_KEY)
  const authService = new AuthService(userCollection, jwtService)

  const user = await authService.findOneByEmail(email)

  if (user) {
    const cryptoService = new CryptoService()
    const isValid = await cryptoService.compare(password, user.password)

    if (isValid) {
      return done(null, user)
    }
  }

  return done(new HttpError(StatusCodes.UNAUTHORIZED, 'Invalid email or password'), false)
})

passport.use(LocalStrategy)

export const localMiddleware = passport.authenticate('local')
export const localMiddlewareNoSession = passport.authenticate('local', { session: false })
