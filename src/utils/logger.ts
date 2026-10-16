import path from 'path'
import winston from 'winston'

const logsDir = path.resolve(process.cwd(), 'logs')

const line = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} ${level.toUpperCase().padEnd(5)} ${message}`
})

const format = winston.format.combine(winston.format.timestamp(), line)

// Never log passwords, JWT secrets, DB passwords or full tokens: log ids and reasons only.
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(logsDir, 'app.log') }),
    new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
  ],
})

export default logger
