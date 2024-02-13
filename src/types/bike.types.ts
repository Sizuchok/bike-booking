import { z } from 'zod'
import { createBikeSchema } from '../schemas/bike/create-bike.schema'
import { updateBikeShema } from '../schemas/bike/update-bike.schema'
import { MongoId } from './common.types'

export type Bike = MongoId & CreateBike

export type BikeForMongo = Omit<Bike, '_id'>

export type BikeAvailability = z.infer<typeof createBikeSchema.shape.status>

export type CreateBike = z.infer<typeof createBikeSchema>

export type UpdateBike = z.infer<typeof updateBikeShema>
