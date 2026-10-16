import { Request, Response } from 'express'
import rateLimit, { Options } from 'express-rate-limit'
import logger from '../utils/logger'

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000

const tooMany = (message: string) => (req: Request, res: Response, _next: unknown, options: Options) => {
  logger.warn(`RATE_LIMIT exceeded ip=${req.ip} ${req.method} ${req.originalUrl}`)
  res.status(options.statusCode).json({ message })
}

// Strict limiter for signup and login: slows down password guessing and account spam.
export const authLimiter = rateLimit({
  windowMs,
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: tooMany('Too many attempts, please try again later'),
})

// Looser limiter for the rest of the API.
export const apiLimiter = rateLimit({
  windowMs,
  limit: Number(process.env.API_RATE_LIMIT_MAX) || 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: tooMany('Too many requests, please slow down'),
})
