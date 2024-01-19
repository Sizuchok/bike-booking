import { NextFunction, Request, RequestHandler, Response } from 'express'
import { ZodError, ZodSchema } from 'zod'
import { fromZodError } from 'zod-validation-error'

type ParamKey = 'body' | 'params' | 'query'

type ValidatorParams = {
  [key: string]: ZodSchema
} & (
  | { body: ZodSchema; params?: ZodSchema; query?: ZodSchema }
  | { body?: ZodSchema; params: ZodSchema; query?: ZodSchema }
  | { body?: ZodSchema; params?: ZodSchema; query: ZodSchema }
)

export const validateRequest = (validations: ValidatorParams): RequestHandler => {
  return (req: Request, _: Response, next: NextFunction) => {
    try {
      for (const vKey in validations) {
        const reqkey = vKey as ParamKey
        if (validations[vKey]) {
          req[reqkey] = validations[vKey]!.parse(req[reqkey])
        }
      }

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors

        // const message = errors.map(({ message }) => message).join('; ')

        // next(new HttpError(StatusCodes.BAD_REQUEST, message))

        const validationError = fromZodError(error)
        next(validationError)
      }

      next(error)
    }
  }
}
