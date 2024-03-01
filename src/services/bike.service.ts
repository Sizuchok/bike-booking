import { StatusCodes } from 'http-status-codes'
import { Collection, ObjectId } from 'mongodb'
import { HttpError } from '../error/http-error'
import { Bike, BikeForMongo, BikeStatuses, CreateBike, UpdateBike } from '../types/bike.types'
import { UserForMongo } from '../types/user.types'

const bikeMongoStatusesMap: {
  [key in BikeStatuses]: BikeStatuses[]
} = {
  available: ['busy', 'unavailable'],
  unavailable: ['available'],
  busy: ['available'],
}

export class BikeService {
  constructor(
    private bikesCollection: Collection<BikeForMongo>,
    private usersCollection: Collection<UserForMongo>,
  ) {}

  findOneById = async (id: string) => {
    const bike = await this.bikesCollection.findOne({ _id: new ObjectId(id) })

    if (!bike) throw new HttpError(StatusCodes.NOT_FOUND, 'Bike not found')

    return bike
  }

  findAllBikes = async () => {
    const bikesAndStats = await this.bikesCollection
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

  private makeBikeUnOrAvailable = async (id: string, newData: UpdateBike) => {
    const oldBike = await this.bikesCollection.findOne({
      _id: new ObjectId(id),
      status: { $in: bikeMongoStatusesMap[newData.status!] },
    })

    if (!oldBike) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Bike not found or it cannot be updated to specified status',
      )
    }

    const updatedBike = await this.bikesCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: newData },
      {
        returnDocument: 'after',
      },
    )

    // if bike old status was not 'busy', then there is no need to delete if from users
    if (!oldBike?.bookedById) {
      return updatedBike
    }

    const userUpdate = await this.usersCollection.updateOne(
      { _id: new ObjectId(oldBike.bookedById) },
      { $pull: { booked: { _id: new ObjectId(updatedBike?._id) } } },
    )

    if (!userUpdate.modifiedCount) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Failed to update user')
    }

    return updatedBike
  }

  private makeBikeBusy = async (id: string, newData: UpdateBike) => {
    const bike = await this.bikesCollection.findOneAndUpdate(
      { _id: new ObjectId(id), status: { $in: bikeMongoStatusesMap[newData.status!] } },
      { $set: newData },
      {
        returnDocument: 'after',
      },
    )

    if (!bike) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Bike not found or it cannot be updated to specified status',
      )
    }

    const updatedOwnder = await this.usersCollection.updateOne(
      { _id: new ObjectId(bike.ownerId), 'bikes._id': bike._id },
      { $set: { 'bikes.$.status': newData.status } },
    )

    const udpatedBookedBy = await this.usersCollection.updateOne(
      { _id: new ObjectId(newData.bookedById!) },
      { $push: { booked: bike } },
    )

    if (!udpatedBookedBy.modifiedCount || !updatedOwnder.modifiedCount) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Failed to update user')
    }

    return bike
  }

  updateOneById = async (id: string, newData: UpdateBike) => {
    if (!newData.status) {
      const bike = await this.bikesCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: newData },
        {
          returnDocument: 'after',
        },
      )

      if (!bike) {
        throw new HttpError(StatusCodes.BAD_REQUEST, 'Bike not found for update')
      }

      return bike
    }

    if (newData.status !== 'busy') {
      return this.makeBikeUnOrAvailable(id, newData)
    }

    return this.makeBikeBusy(id, newData)
  }

  createOne = async (newBike: CreateBike) => {
    const result = await this.bikesCollection.insertOne(newBike as Bike)

    const bike = await this.bikesCollection.findOne({ _id: new ObjectId(result.insertedId) })

    if (!result.insertedId) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Failed to add a bike')
    }

    const userUpdate = await this.usersCollection.updateOne(
      { _id: new ObjectId(newBike.ownerId) },
      { $push: { bikes: bike } },
    )

    if (!userUpdate.modifiedCount) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Failed to update user')
    }

    return bike
  }

  deleteOne = async (id: string) => {
    const result = await this.bikesCollection.deleteOne({ _id: new ObjectId(id) })

    // User: delete from bikes[] or booked[] where bike.id === id

    if (!result.deletedCount) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Bike not found for deletion')
    }
  }
}
