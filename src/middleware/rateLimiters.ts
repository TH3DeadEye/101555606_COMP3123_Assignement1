import rateLimit from 'express-rate-limit'
import logger from '../utils/logger'

// Length of each rate-limit window (default 15 minutes)
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000

// Strict limit for signup and login: makes password guessing and account spam slow
export const authLimiter = rateLimit({
  windowMs,
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  standardHeaders: 'draft-7', // send RateLimit headers so clients can see how many requests are left
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`RATE_LIMIT exceeded ip=${req.ip} ${req.method} ${req.originalUrl}`)
    res.status(429).json({ message: 'Too many attempts, please try again later' })
  },
})

// Looser limit for the rest of the API
export const apiLimiter = rateLimit({
  windowMs,
  limit: Number(process.env.API_RATE_LIMIT_MAX) || 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`RATE_LIMIT exceeded ip=${req.ip} ${req.method} ${req.originalUrl}`)
    res.status(429).json({ message: 'Too many requests, please slow down' })
  },
})
