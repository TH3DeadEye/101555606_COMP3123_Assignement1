import 'dotenv/config' // must be first so env vars exist before other modules read them
import connectDB from './config/db'
import app from './app'
import logger from './utils/logger'

const PORT = Number(process.env.PORT) || 3000

const start = async () => {
  await connectDB()
  logger.info('MongoDB connected')
  app.listen(PORT, () => logger.info(`Server started on port ${PORT}`))
}

start().catch((err) => {
  logger.error(`Startup failed: ${err instanceof Error ? err.message : err}`)
  process.exit(1)
})
