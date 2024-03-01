import { z } from 'zod'
import { isObjectIdSchema } from '../common/object-id.schema'

export const createBikeSchema = z
  .object({
    name: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be of string type',
      })
      .min(3, 'Name min length is 3')
      .max(20),
    type: z.string().min(3).max(20),
    color: z.string().min(3).max(20),
    wheelSize: z.number().positive(),
    price: z
      .number({
        required_error: 'Price is required',
        invalid_type_error: 'Price must be a string',
      })
      .positive(),
    description: z.string().max(500),
    status: z.enum(['available', 'unavailable'] as const),
    ownerId: isObjectIdSchema,
    ownerInfo: z.object({
      name: z.string().min(3).max(20),
      email: z.string().email(),
    }),
  })
  .strict()
