import { StatusCodes } from 'http-status-codes'
import { Collection, ObjectId } from 'mongodb'
import { MONGO } from '../const/mongodb-key.const'
import { client } from '../db/db-config'
import { HttpError } from '../error/http-error'
import { Bike, CreateBike, UpdateBike } from '../types/bike.types'

export class BikeService {
  constructor(private collection: Collection<Omit<Bike, '_id'>>) {}

  findOneById = async (id: string) => {
    const bike = await this.collection.findOne({ _id: new ObjectId(id) })

    if (!bike) throw new HttpError(StatusCodes.NOT_FOUND, 'Bike not found')

    return bike
  }

  findAllBikes = async () => {
    const bikesAndStats = await this.collection
      .aggregate([
        {
          $facet: {
            totalBikes: [{ $count: 'count' }],
            available: [{ $match: { status: 'available' } }, { $count: 'available' }],
            busy: [{ $match: { status: 'busy' } }, { $count: 'busy' }],
            avgPrice: [{ $group: { _id: null, avgPrice: { $avg: '$price' } } }],
            bikes: [{ $limit: 20 }],
          },
        },
        {
          $project: {
            count: { $arrayElemAt: ['$totalBikes.count', 0] },
            available: { $arrayElemAt: ['$available.available', 0] },
            busy: { $arrayElemAt: ['$busy.busy', 0] },
            avgPrice: { $arrayElemAt: ['$avgPrice.avgPrice', 0] },
            bikes: 1,
          },
        },
      ])
      .next()

    return bikesAndStats
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
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Failed to add a bike')
    }

    return bike
  }

  deleteOne = async (id: string) => {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) })

    if (!result.deletedCount) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Bike not found for deletion')
    }
  }
}

export const bikesService = new BikeService(
  client.db(MONGO.DB_NAME).collection(MONGO.COLLECTIONS.BIKES),
)
