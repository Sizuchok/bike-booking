import './config/dot-env-config'
// --.env--
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { exceptionFilter } from './middleware/exception-filter.middleware'
import { AppRouter } from './routes'

export const app = express()

app.use(
  cors({
    origin: process.dotEnv.FRONT_END_URL,
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

export const startExpress = () => {
  new AppRouter(app).init()
  app.use(exceptionFilter)

  return app
}

export { bootstrap } from './db/db-config'
