import { Express } from 'express'
import { authRouter } from './auth.routes'
import { bikesRouter } from './bikes.routes'
import { jwtAuth } from '../middleware/jwt.middleware'

export class AppRouter {
  constructor(private app: Express) {}

  init() {
    this.app.use('/bikes', jwtAuth, bikesRouter)
    this.app.use('/auth', authRouter)
  }
}
