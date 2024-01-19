import { createBikeSchema } from './create-bike.schema'

export const updateBikeShema = createBikeSchema.partial().refine(arg => Object.values(arg).length, {
  message: 'At least one field should be provided for update',
})
