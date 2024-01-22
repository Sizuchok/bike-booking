import { User as UserType } from '../user.types'

declare global {
  namespace Express {
    interface User extends UserType {}
  }
}
