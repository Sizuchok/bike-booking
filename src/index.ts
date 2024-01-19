import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import { bootstrap } from './db/config'
import { exceptionFilter } from './middleware/exception-filter.middleware'
import { AppRouter } from './routes'

const PORT = process.env.PORT ?? 3000
const SESSION_SECRET = process.env.SESSION_SECRET!

const app = express()

app.use(express.json())

app.use(
  session({
    secret: SESSION_SECRET,
    name: 'session_id',
    resave: false,
    cookie: {
      maxAge: 20 * 1000,
    },
    saveUninitialized: false,
  }),
)

bootstrap(() => {
  new AppRouter(app).init()
  app.use(exceptionFilter)

  app.listen(PORT, () => console.log('Started on port: ' + PORT))
})
