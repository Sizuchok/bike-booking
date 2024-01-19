import { z } from 'zod'
import { createBikeSchema } from '../../schemas/bike/create-bike.schema'
import { updateBikeShema } from '../../schemas/bike/update-bike.schema'

export type Bike = CreateBike & {
  _id: string
}

export type CreateBike = z.infer<typeof createBikeSchema>

export type UpdateBike = z.infer<typeof updateBikeShema>
