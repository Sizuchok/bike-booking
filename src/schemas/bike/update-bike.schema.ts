import { z } from 'zod'
import { isObjectIdSchema } from '../common/object-id.schema'
import { signUpSchema } from '../user/sign-up.schema'
import { createBikeSchema } from './create-bike.schema'

export const updateBikeShema = createBikeSchema
  .omit({ ownerId: true, ownerInfo: true, status: true })
  .extend({
    bookedById: isObjectIdSchema.nullable(),
    bookedByInfo: signUpSchema
      .pick({
        name: true,
        email: true,
      })
      .nullable(),
    status: z.enum(['available', 'unavailable', 'busy'] as const),
  })
  .partial()
  .refine(arg => Object.values(arg).length, {
    message: 'At least one field should be provided for update',
  })
  .refine(
    ({ status, bookedById, bookedByInfo }) => {
      const isUnOrAvailable = status === 'available' || status === 'unavailable' || !status
      const isBusy = status === 'busy'
      const isBooked = bookedById && bookedByInfo
      const isNotBooked = bookedById === null && bookedByInfo === null

      return (isUnOrAvailable && isNotBooked) || (isBusy && isBooked)
    },
    {
      message: 'Incompatible bike status and bookedBy* properties value',
    },
  )
