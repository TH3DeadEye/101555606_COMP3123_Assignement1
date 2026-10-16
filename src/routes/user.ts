import express from 'express'
import { signup, login } from '../controllers/user'
import { validate } from '../middleware/validate'
import { signupSchema, loginSchema } from '../validators/user'
import { authLimiter } from '../middleware/rateLimiters'

const user_router = express.Router()

// Rate limit first, so blocked requests never reach validation or the database
user_router.post('/signup', authLimiter, validate({ body: signupSchema }), signup)
user_router.post('/login', authLimiter, validate({ body: loginSchema }), login)

export default user_router
