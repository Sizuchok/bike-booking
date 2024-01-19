import { StatusCodes } from 'http-status-codes'
import { Collection, Document, ObjectId } from 'mongodb'
import { MONGO_COLLECTION_EMPLOYESS, MONGO_DB_NAME } from '../const/mongodb-key.const'
import { client } from '../db/config'
import { HttpError } from '../error/http-error'
import { CreateBike, UpdateBike } from '../types/bike/bike.types'

export class BikeService {
  constructor(private collection: Collection<Document>) {}

  findOneById = async (id: string) => {
    const bike = await this.collection.findOne({ _id: new ObjectId(id) })

    if (!bike) throw new HttpError(StatusCodes.NOT_FOUND, 'Bike not found')

    return bike
  }

  findAllBikes = async () => {
    const bikes = this.collection.find().limit(20).toArray()
    return bikes
  }

  updateOneById = async (id: string, newData: UpdateBike) => {
    const bike = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: newData },
      {
        returnDocument: 'after',
      },
    )

    if (!bike) throw new HttpError(StatusCodes.BAD_REQUEST, 'Bike not found for update')

    return bike
  }

  createOne = async (newBike: CreateBike) => {
    const result = await this.collection.insertOne(newBike)

    const bike = await this.collection.findOne({ _id: new ObjectId(result.insertedId) })

    if (!result.insertedId) {
      throw new HttpError(StatusCodes.BAD_GATEWAY, 'Failed to add a bike')
    }

    return bike
  }

  deleteOne = async (id: string) => {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) })

    if (!result.deletedCount) {
      throw new HttpError(StatusCodes.BAD_GATEWAY, 'Bike not found for deletion')
    }
  }
}

export const bikesService = new BikeService(
  client.db(MONGO_DB_NAME).collection(MONGO_COLLECTION_EMPLOYESS),
)
