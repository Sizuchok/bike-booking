import { z } from 'zod'
import { createBikeSchema } from '../schemas/bike/create-bike.schema'
import { updateBikeShema } from '../schemas/bike/update-bike.schema'
import { MongoId } from './common.types'

export type Bike = MongoId & CreateBike

export type CreateBike = z.infer<typeof createBikeSchema>

export type UpdateBike = z.infer<typeof updateBikeShema>
