import express, { Router } from 'express'
import { bikesController } from '../controllers/bike.controller'
import { validateRequest } from '../middleware/validator.middleware'
import { createBikeSchema } from '../schemas/bike/create-bike.schema'
import { updateBikeShema } from '../schemas/bike/update-bike.schema'
import { objectIdParamSchema } from '../schemas/common/object-id.schema'
import { controllerWrapper } from '../utils/controller-wrapper.util'

export const bikesRouter: Router = express.Router()

const {
  findAll: getAllBikes,
  findOneById: getOneBike,
  updateOneById: updateOneBike,
  createOne: createOneBike,
} = bikesController

bikesRouter.get('/', controllerWrapper(getAllBikes))

bikesRouter.get(
  '/:id',
  validateRequest({ params: objectIdParamSchema }),
  controllerWrapper(getOneBike),
)

bikesRouter.patch(
  '/:id',
  validateRequest({ body: updateBikeShema, params: objectIdParamSchema }),
  controllerWrapper(updateOneBike),
)

bikesRouter.post('/', validateRequest({ body: createBikeSchema }), controllerWrapper(createOneBike))
