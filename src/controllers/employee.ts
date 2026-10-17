import { Request, Response, NextFunction } from 'express'
import Employee from '../models/Employee'
import User from '../models/User'
import logger from '../utils/logger'

// These handlers only run after the auth and validate middleware, so:
// - req.user.id is the logged-in user, taken from the JWT
// - the eid is already checked, and req.body only contains known employee fields
//   (validation removes anything else, including "user", so the client can't pick the owner)

// GET /api/v1/emp/employees - list only the logged-in user's employees
export const listEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const employees = await Employee.find({ user: userId })
    return res.status(200).json(employees)
  } catch (err) {
    next(err)
  }
}

// POST /api/v1/emp/employees - create an employee owned by the logged-in user
export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id

    // Every employee needs an existing owner (the account could be deleted after login)
    const owner = await User.findById(userId)
    if (!owner) {
      return res.status(401).json({ message: 'User for this token no longer exists' })
    }

    const employee = await Employee.create({ ...req.body, user: userId })
    logger.info(`EMPLOYEE created id=${employee._id} owner=${userId}`)
    return res.status(201).json(employee)
  } catch (err) {
    next(err)
  }
}

// GET /api/v1/emp/employees/:eid - get one employee
export const getEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const employee = await Employee.findById(req.params.eid)

    if (!employee) {
      logger.warn(`EMPLOYEE not found id=${req.params.eid} user=${userId}`)
      return res.status(404).json({ message: 'Employee not found' })
    }
    // The employee exists, but does it belong to this user?
    if (employee.user.toString() !== userId) {
      logger.warn(`ACCESS denied employee=${employee._id} user=${userId}`)
      return res.status(403).json({ message: 'You are not allowed to access this employee' })
    }

    return res.status(200).json(employee)
  } catch (err) {
    next(err)
  }
}

// PUT /api/v1/emp/employees/:eid - update one employee
export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const employee = await Employee.findById(req.params.eid)

    if (!employee) {
      logger.warn(`EMPLOYEE not found id=${req.params.eid} user=${userId}`)
      return res.status(404).json({ message: 'Employee not found' })
    }
    if (employee.user.toString() !== userId) {
      logger.warn(`ACCESS denied employee=${employee._id} user=${userId}`)
      return res.status(403).json({ message: 'You are not allowed to access this employee' })
    }

    employee.set(req.body)
    await employee.save() // save() also runs the schema validators
    logger.info(`EMPLOYEE updated id=${employee._id} owner=${userId}`)
    return res.status(200).json(employee)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/v1/emp/employees?eid=xxx - delete one employee
export const deleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const employee = await Employee.findById(req.query.eid)

    if (!employee) {
      logger.warn(`EMPLOYEE not found id=${req.query.eid} user=${userId}`)
      return res.status(404).json({ message: 'Employee not found' })
    }
    if (employee.user.toString() !== userId) {
      logger.warn(`ACCESS denied employee=${employee._id} user=${userId}`)
      return res.status(403).json({ message: 'You are not allowed to access this employee' })
    }

    await employee.deleteOne()
    logger.info(`EMPLOYEE deleted id=${employee._id} owner=${userId}`)
    return res.status(204).send()
  } catch (err) {
    next(err)
  }
}
