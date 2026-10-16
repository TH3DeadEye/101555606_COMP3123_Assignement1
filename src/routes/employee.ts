import express from 'express'
import { auth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  eidParamSchema,
  eidQuerySchema,
} from '../validators/employee'
import {
  listEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employee'

const employee_router = express.Router()

// Every employee route requires a valid JWT (checked before any validation)
employee_router.use(auth)

employee_router.get('/employees', listEmployees)
employee_router.post('/employees', validate({ body: createEmployeeSchema }), createEmployee)
employee_router.get('/employees/:eid', validate({ params: eidParamSchema }), getEmployee)
employee_router.put(
  '/employees/:eid',
  validate({ params: eidParamSchema, body: updateEmployeeSchema }),
  updateEmployee
)
employee_router.delete('/employees', validate({ query: eidQuerySchema }), deleteEmployee)

export default employee_router
