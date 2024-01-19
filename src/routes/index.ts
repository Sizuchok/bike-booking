import { Express } from 'express'
import { bikesRouter } from './bikes.routes'

export class AppRouter {
  constructor(private app: Express) {}

  init() {
    this.app.use('/bikes', bikesRouter)
  }
}
