import express from 'express'
import helmet from 'helmet'
import health_router from './routes/health'
import user_router from './routes/user'
import employee_router from './routes/employee'
import { requestLogger } from './middleware/requestLogger'
import { apiLimiter } from './middleware/rateLimiters'
import { notFound, errorHandler } from './middleware/errorHandler'

const app = express()

// Security headers first so every response (including errors) gets them
app.use(helmet())
app.use(requestLogger)
app.use(express.json({ limit: '10kb' }))

app.use("/health", health_router)
app.use("/api", apiLimiter)
app.use("/api/v1/user", user_router)
app.use("/api/v1/emp", employee_router)

// Must come last: unknown routes, then the central error handler
app.use(notFound)
app.use(errorHandler)

export default app
