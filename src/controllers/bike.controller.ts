import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { BikeService, bikesService } from '../services/bike.service'
import { CreateBike, UpdateBike } from '../types/bike/bike.types'

export class BikeController {
  constructor(private bikesService: BikeService) {}

  findAll = async (req: Request, res: Response) => {
    const bikes = await this.bikesService.findAllBikes()

    res.json(bikes)
  }

  findOneById = async (req: Request<{ id: string }>, res: Response) => {
    const bike = await this.bikesService.findOneBikeById(req.params.id)
    res.json(bike)
  }

  updateOneById = async (req: Request<{ id: string }, {}, UpdateBike>, res: Response) => {
    const { id } = req.params
    const bike = await this.bikesService.updateOneById(id, req.body)
    res.json(bike)
  }

  createOne = async (req: Request<{}, {}, CreateBike>, res: Response) => {
    const bike = await this.bikesService.createOne(req.body)
    res.status(StatusCodes.CREATED).json(bike)
  }
}

export const bikesController = new BikeController(bikesService)
