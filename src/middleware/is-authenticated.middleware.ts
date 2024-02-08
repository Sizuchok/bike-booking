import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { HttpError } from '../error/http-error'

export const isAuthenticated = (req: Request, _: Response, next: NextFunction) => {
  if (req.user) {
    return next()
  }

  next(new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized'))
}
