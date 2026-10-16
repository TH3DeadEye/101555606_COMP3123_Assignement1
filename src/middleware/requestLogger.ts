import morgan from 'morgan'
import logger from '../utils/logger'

// One line per request: method, path, status, response time. Morgan writes into winston,
// so requests end up in the same log file as everything else.
// Headers and bodies are never logged, so tokens and passwords can't leak here.
export const requestLogger = morgan(':method :url :status :response-time ms', {
  stream: { write: (message) => logger.info(`HTTP ${message.trim()}`) },
})
