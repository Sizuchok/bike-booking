import { ObjectId } from 'mongodb'
import { z } from 'zod'

export const isObjectIdSchema = z.string().refine(value => ObjectId.isValid(value), {
  message: 'Id must be of type ObjectId',
})

export const objectIdParamSchema = z.object({
  id: isObjectIdSchema,
})
