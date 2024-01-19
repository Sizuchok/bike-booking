import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { HttpError } from '../error/http-error'

export const exceptionFilter = (
  error: HttpError,
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  const status = error.status ?? StatusCodes.INTERNAL_SERVER_ERROR
  const message = error.message ?? 'Internal server error'

  res.status(status).json({
    status,
    message,
  })

  next()
}
