import { Request, Response, NextFunction } from 'express'
import { ZodType } from 'zod'
import { AppError, ErrorDetail } from '../utils/AppError'
import logger from '../utils/logger'

interface Schemas {
  body?: ZodType
  params?: ZodType
  query?: ZodType
}

// Runs the given zod schemas against the request. On failure it passes a 400 AppError
// (with one entry per problem) to the error handler. On success, req.body is replaced
// with the parsed data, which drops any fields the schema doesn't know about.
export const validate = (schemas: Schemas) => (req: Request, _res: Response, next: NextFunction) => {
  const details: ErrorDetail[] = []

  for (const part of ['params', 'query', 'body'] as const) {
    const schema = schemas[part]
    if (!schema) continue

    const result = schema.safeParse(req[part] ?? {})
    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = [part, ...issue.path].join('.')
        details.push({ field: path, message: issue.message })
      }
    } else if (part === 'body') {
      req.body = result.data
    }
  }

  if (details.length > 0) {
    // Log which fields failed, never their values (they may be passwords)
    logger.warn(`VALIDATION failed ${req.method} ${req.originalUrl} fields=${details.map((d) => d.field).join(',')}`)
    return next(new AppError('Validation failed', 400, details))
  }
  next()
}
