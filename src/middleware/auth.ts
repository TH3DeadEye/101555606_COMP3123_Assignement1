import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import logger from '../utils/logger'

// TypeScript doesn't know about req.user by default.
// This tells it that a request can carry the logged-in user's id.
declare global {
  namespace Express {
    interface Request {
      user?: { id: string }
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    logger.warn(`AUTH denied (no bearer token) ${req.method} ${req.originalUrl}`)
    return res.status(401).json({ message: 'Missing or malformed Authorization header' })
  }

  const token = header.replace('Bearer ', '')

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET is not set')

    // verify() checks the signature and the expiry, then gives back what we put in the token at login
    const payload = jwt.verify(token, secret) as { id: string }
    req.user = { id: payload.id }
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      logger.warn(`AUTH denied (expired token) ${req.method} ${req.originalUrl}`)
      return res.status(401).json({ message: 'Token expired' })
    }
    if (err instanceof jwt.JsonWebTokenError) {
      logger.warn(`AUTH denied (invalid token) ${req.method} ${req.originalUrl}`)
      return res.status(401).json({ message: 'Invalid token' })
    }
    next(err)
  }
}
