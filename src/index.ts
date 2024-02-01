import './config/dot-env-config'
// --.env--
import MongoStore from 'connect-mongo'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import passport from 'passport'
import { MONGO } from './const/mongodb-key.const'
import { bootstrap } from './db/config'
import { exceptionFilter } from './middleware/exception-filter.middleware'
import { isAuthenticated } from './middleware/is-authenticated.middleware'
import { AppRouter } from './routes'

const PORT = process.dotEnv.PORT
const SESSION_SECRET = process.dotEnv.SESSION_SECRET

const app = express()
app.use(
  cors({
    origin: process.dotEnv.FRONT_END_URL,
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

const mongoStore = MongoStore.create({
  mongoUrl: process.dotEnv.MONGO_DB_URL,
  collectionName: MONGO.COLLECTIONS.SESSIONS,
  dbName: MONGO.DB_NAME,
})

app.use(
  session({
    secret: SESSION_SECRET,
    name: 'session_id',
    resave: false,
    cookie: {
      maxAge: 15 * 60 * 1000,
    },
    saveUninitialized: false,
    store: mongoStore,
  }),
)

bootstrap(() => {
  app.use(passport.session())
  app.use(isAuthenticated)
  new AppRouter(app).init()
  app.use(exceptionFilter)

  app.listen(PORT, () => console.log('Started on port: ' + PORT))
})
