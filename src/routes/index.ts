import { Express } from 'express'
import { authRouter } from './auth.routes'
import { bikesRouter } from './bikes.routes'

export class AppRouter {
  constructor(private app: Express) {}

  init() {
    this.app.use('/bikes', bikesRouter)
    this.app.use('/auth', authRouter)
  }
}
