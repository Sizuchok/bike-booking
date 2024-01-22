import MongoStore from 'connect-mongo'
import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import passport from 'passport'
import { MONGO } from './const/mongodb-key.const'
import { bootstrap } from './db/config'
import { exceptionFilter } from './middleware/exception-filter.middleware'
import { isAuthenticated } from './middleware/is-authenticated.middleware'
import { AppRouter } from './routes'

const PORT = process.env.PORT ?? 3000
const SESSION_SECRET = process.env.SESSION_SECRET!

const app = express()

app.use(express.json())

const mongoStore = MongoStore.create({
  mongoUrl: process.env.MONGO_DB_URL,
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
  app.use(passport.initialize())
  app.use(isAuthenticated)
  new AppRouter(app).init()
  app.use(exceptionFilter)

  app.listen(PORT, () => console.log('Started on port: ' + PORT))
})
