import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { HttpError } from '../error/http-error'

const publicRoutes = ['/auth/sign-in', '/auth/sign-up']

export const isAuthenticated = (req: Request, _: Response, next: NextFunction) => {
  if (req.user || publicRoutes.includes(req.path)) {
    return next()
  }

  return next(new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized'))
}
