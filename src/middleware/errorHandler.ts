import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'

// Runs when no route matched the request
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

// Central error handler: every error passed to next(err) ends up here.
// It always answers with JSON and never sends stack traces to the client.
// Express knows this is an error handler because it has 4 parameters.
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // The request body was not valid JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON in request body' })
  }

  // The request body was bigger than the 10kb limit set in app.ts
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body too large' })
  }

  // MongoDB duplicate key, e.g. two signups with the same email at the same moment
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Username or email already in use' })
  }

  // Mongoose rejected the data or an id
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: err.message })
  }

  // Anything else is unexpected: log the details, send the client a generic message
  logger.error(`UNHANDLED ${req.method} ${req.originalUrl} ${err.stack || err}`)
  return res.status(500).json({ message: 'Internal server error' })
}
