import passport from 'passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { FullPayload, JwtService } from '../services/jwt.service'
import { AuthService } from '../services/auth.service'
import { userCollection } from '../db/collections.const'

const JwtStrategy = new Strategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.dotEnv.JWT_SECRET_KEY,
    ignoreExpiration: false,
  },
  async (payload: FullPayload, done) => {
    try {
      const jwtService = new JwtService(process.dotEnv.JWT_SECRET_KEY)
      const authService = new AuthService(userCollection, jwtService)
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
