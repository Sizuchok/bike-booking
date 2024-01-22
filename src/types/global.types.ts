import { User as UserType } from './user.types'

declare global {
  namespace Express {
    interface User extends UserType {}
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string
      SESSION_SECRET?: string
      MONGO_DB_USER?: string
      MONGO_DB_PASSWORD?: string
      MONGO_DB_URL?: string
    }
  }
}
