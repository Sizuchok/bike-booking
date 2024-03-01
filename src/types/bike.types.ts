import { z } from 'zod'
import { createBikeSchema } from '../schemas/bike/create-bike.schema'
import { updateBikeShema } from '../schemas/bike/update-bike.schema'
import { MongoId } from './common.types'

export type Bike = MongoId &
  Omit<CreateBike, 'status'> &
  Required<Pick<UpdateBike, 'bookedById'>> & {
    status: BikeStatuses
  }

export type BikeStatuses = 'available' | 'unavailable' | 'busy'

export type BikeForMongo = Omit<Bike, '_id'>

export type BikeAvailability = z.infer<typeof createBikeSchema.shape.status>

export type CreateBike = z.infer<typeof createBikeSchema>

type UpdateBikeSchema = z.infer<typeof updateBikeShema>

export type UpdateBike = Omit<UpdateBikeSchema, 'status'> &
  Partial<{
    status: BikeStatuses
  }>
