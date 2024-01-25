import { Request } from 'express'
import passport from 'passport'
import { JwtFromRequestFunction, Strategy } from 'passport-jwt'
import { ACCESS_TOKEN } from '../const/keys/common-keys.const'
import { authService } from '../services/auth.service'
import { FullPayload } from '../services/jwt.service'

const cookieExtractor: JwtFromRequestFunction<Request> = req => {
  return req.cookies[ACCESS_TOKEN] ?? null
}

const JwtStrategy = new Strategy(
  {
    jwtFromRequest: cookieExtractor as any,
    secretOrKey: process.env.SECRET_KEY,
    ignoreExpiration: false,
  },
  async (payload: FullPayload, done) => {
    try {
      const user = await authService.findOneById(payload.sub as string)

      if (!user) {
        return done(null, false)
      }

      done(null, user)
    } catch (error) {
      done(error)
    }
  },
)

passport.use(JwtStrategy)

export const jwtMiddleware = passport.authenticate('jwt', { session: false })
