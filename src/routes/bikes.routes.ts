import express, { Router } from 'express'
import { bikesController } from '../controllers/bike.controller'
import { validateRequest } from '../middleware/validator.middleware'
import { createBikeSchema } from '../schemas/bike/create-bike.schema'
import { updateBikeShema } from '../schemas/bike/update-bike.schema'
import { objectIdParamSchema } from '../schemas/common/object-id.schema'
import { controllerWrapper } from '../utils/controller-wrapper.util'

export const bikesRouter: Router = express.Router()

const { findAll, findOneById, updateOneById, createOne, deleteOne } = bikesController

bikesRouter.get('/', controllerWrapper(findAll))

bikesRouter.get(
  '/:id',
  validateRequest({ params: objectIdParamSchema }),
  controllerWrapper(findOneById),
)

bikesRouter.post('/', validateRequest({ body: createBikeSchema }), controllerWrapper(createOne))

bikesRouter.patch(
  '/:id',
  validateRequest({ body: updateBikeShema, params: objectIdParamSchema }),
  controllerWrapper(updateOneById),
)

bikesRouter.delete(
  '/:id',
  validateRequest({ params: objectIdParamSchema }),
  controllerWrapper(deleteOne),
)
