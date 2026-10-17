import express from 'express'
import { auth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { createEmployeeSchema, updateEmployeeSchema, eidSchema } from '../validators/employee'
import {
  listEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employee'

const employee_router = express.Router()

// Every employee route needs a valid JWT
employee_router.use(auth)

employee_router.get('/employees', listEmployees)
employee_router.post('/employees', validate(createEmployeeSchema), createEmployee)
employee_router.get('/employees/:eid', validate(eidSchema, 'params'), getEmployee)
employee_router.put('/employees/:eid', validate(eidSchema, 'params'), validate(updateEmployeeSchema), updateEmployee)
employee_router.delete('/employees', validate(eidSchema, 'query'), deleteEmployee)

export default employee_router
