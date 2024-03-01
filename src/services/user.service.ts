import { StatusCodes } from 'http-status-codes'
import { Collection, ObjectId } from 'mongodb'
import { HttpError } from '../error/http-error'
import { UserForMongo } from '../types/user.types'

export class UserService {
  constructor(private collection: Collection<UserForMongo>) {}

  findOneById = async (id: string) => {
    const user = await this.collection.findOne(
      { _id: new ObjectId(id) },
      {
        projection: { password: 0, refreshTokens: 0 },
      },
    )

    if (!user) throw new HttpError(StatusCodes.NOT_FOUND, 'User not found')

    return user
  }

  deleteOne = async (id: string) => {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) })

    if (!result.deletedCount) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'User not found for deletion')
    }
  }
}
