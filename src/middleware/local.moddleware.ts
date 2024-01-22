import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import passport from 'passport'
import { Strategy } from 'passport-local'
import { HttpError } from '../error/http-error'
import { authService } from '../services/auth.service'
import { cryptoService } from '../services/hashing/crypto.service'

const LocalStrategy = new Strategy({ usernameField: 'email' }, async (email, password, done) => {
  const user = await authService.findOneByEmail(email)

  if (user) {
    const isValid = await cryptoService.compare(password, user.password)

    if (isValid) {
      return done(null, user)
    }
  }

  return done(new HttpError(StatusCodes.BAD_REQUEST, 'Invalid email or password'), false)
})

passport.serializeUser<ObjectId>((user, done) => {
  process.nextTick(() => {
    return done(null, user._id)
  })
})

passport.deserializeUser<string>(async (id, done) => {
  const user = await authService.findOneById(id)

  if (!user) {
    return done(new HttpError(StatusCodes.NOT_FOUND, 'User not found'))
  }

  process.nextTick(() => {
    done(null, user)
  })
})

passport.use(LocalStrategy)

export const localMiddleware = passport.authenticate('local')
