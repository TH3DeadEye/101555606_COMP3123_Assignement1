import { Request, Response, NextFunction } from 'express'
import { ZodType } from 'zod'
import logger from '../utils/logger'

// validate(schema, source) creates a middleware that checks one part of the request
// (the body by default) against a zod schema.
// - Invalid: responds 400 with a list of what's wrong.
// - Valid: replaces req.body with the cleaned data (trimmed, email lowercased,
//   unknown fields such as "user" removed) and moves on to the next handler.
export const validate = (schema: ZodType, source: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source])

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }))
      // Only log which fields failed, never their values (they could be passwords)
      const fields = errors.map((e) => e.field).join(',')
      logger.warn(`VALIDATION failed ${req.method} ${req.originalUrl} fields=${fields}`)
      return res.status(400).json({ message: 'Validation failed', errors })
    }

    if (source === 'body') {
      req.body = result.data
    }
    next()
  }
}
