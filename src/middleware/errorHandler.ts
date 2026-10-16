import { Request, Response, NextFunction } from 'express'
import { Error as MongooseError } from 'mongoose'
import { AppError, ErrorDetail } from '../utils/AppError'
import logger from '../utils/logger'

// Unknown route -> JSON 404 (instead of Express's default HTML page)
export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404))
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

// The one place every error ends up. Always responds with JSON and never leaks stack traces.
// Express recognises an error handler by it having exactly 4 parameters.
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // Errors we threw on purpose
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.details && { errors: err.details }),
    })
  }

  // Malformed JSON body / body too large (from express.json)
  if (isObject(err) && err['type'] === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON in request body' })
  }
  if (isObject(err) && err['type'] === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body too large' })
  }

  // Duplicate key (e.g. two signups racing past the "already exists" check)
  if (isObject(err) && err['code'] === 11000) {
    const fields = Object.keys((err['keyPattern'] as object | undefined) ?? {})
    return res.status(409).json({
      message: `Duplicate value${fields.length ? ` for: ${fields.join(', ')}` : ''}`,
    })
  }

  // Mongoose schema validation / bad ids
  if (err instanceof MongooseError.ValidationError) {
    const errors: ErrorDetail[] = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }))
    return res.status(400).json({ message: 'Validation failed', errors })
  }
  if (err instanceof MongooseError.CastError) {
    return res.status(400).json({ message: `Invalid value for ${err.path}` })
  }

  // Anything else is a bug or an outage: log it server-side, tell the client nothing specific
  logger.error(`UNHANDLED ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`)
  return res.status(500).json({ message: 'Internal server error' })
}
