import passport from 'passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { authService } from '../services/auth.service'
import { FullPayload } from '../services/jwt.service'

const JwtStrategy = new Strategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.dotEnv.JWT_SECRET_KEY,
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

export const jwtAuth = passport.authenticate('jwt', { session: false })
