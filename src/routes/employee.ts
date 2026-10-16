import express from 'express'
import { auth } from '../middleware/auth'
import {
  listEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employee'

const employee_router = express.Router()

// Every employee route requires a valid JWT
employee_router.use(auth)

employee_router.get('/employees', listEmployees)
employee_router.post('/employees', createEmployee)
employee_router.get('/employees/:eid', getEmployee)
employee_router.put('/employees/:eid', updateEmployee)
employee_router.delete('/employees', deleteEmployee)

export default employee_router
