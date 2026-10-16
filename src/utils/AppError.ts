export interface ErrorDetail {
  field: string
  message: string
}

// An error we throw on purpose, carrying the HTTP status the client should see.
export class AppError extends Error {
  statusCode: number
  details: ErrorDetail[] | undefined

  constructor(message: string, statusCode: number, details?: ErrorDetail[]) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.details = details
  }
}
