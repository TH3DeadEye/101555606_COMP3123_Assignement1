import express from 'express'
import health_router from './routes/health'
import user_router from './routes/user'
import employee_router from './routes/employee'

const app = express()

app.use(express.json())

app.use("/health", health_router)
app.use("/api/v1/user", user_router)
app.use("/api/v1/emp", employee_router)

export default app
