import { NextFunction, Request, Response } from 'express'

type ControllerFunction<ReqParams, ResBody, ReqBody, ReqQuery> = (
  request: Request<ReqParams, ResBody, ReqBody, ReqQuery>,
  response: Response,
  next: NextFunction,
) => Promise<unknown>

export const controllerWrapper =
  <ReqParams, ResBody, ReqBody, ReqQuery>(
    requestHandler: ControllerFunction<ReqParams, ResBody, ReqBody, ReqQuery>,
  ) =>
  async (
    request: Request<ReqParams, ResBody, ReqBody, ReqQuery>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      await requestHandler(request, response, next)
    } catch (error) {
      next(error)
    }
  }
