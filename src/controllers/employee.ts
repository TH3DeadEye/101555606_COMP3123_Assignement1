import { Request, Response, NextFunction } from 'express'
import { isValidObjectId } from 'mongoose'
import Employee from '../models/Employee'
import User from '../models/User'

// Only these fields may be set from the request body.
// "user" is deliberately NOT in this list: the owner always comes from the JWT.
const ALLOWED_FIELDS = ['first_name', 'last_name', 'email', 'position', 'salary', 'date_of_joining', 'department']

const pickAllowed = (body: Record<string, unknown>) => {
  const out: Record<string, unknown> = {}
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key]
  }
  return out
}

export const listEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employees = await Employee.find({ user: req.user!.id })
    return res.status(200).json(employees)
  } catch (err) {
    next(err)
  }
}

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // The owner must exist (e.g. the account could have been deleted after the token was issued)
    const owner = await User.exists({ _id: req.user!.id })
    if (!owner) {
      return res.status(401).json({ message: 'User for this token no longer exists' })
    }

    const employee = await Employee.create({ ...pickAllowed(req.body ?? {}), user: req.user!.id })
    return res.status(201).json(employee)
  } catch (err) {
    next(err)
  }
}

export const getEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eid = req.params.eid
    if (!eid || !isValidObjectId(eid)) {
      return res.status(400).json({ message: 'Invalid employee id' })
    }

    // Filtering by BOTH _id and user is what enforces ownership
    const employee = await Employee.findOne({ _id: eid, user: req.user!.id })
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }
    return res.status(200).json(employee)
  } catch (err) {
    next(err)
  }
}

export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eid = req.params.eid
    if (!eid || !isValidObjectId(eid)) {
      return res.status(400).json({ message: 'Invalid employee id' })
    }

    const employee = await Employee.findOneAndUpdate(
      { _id: eid, user: req.user!.id },
      pickAllowed(req.body ?? {}),
      { new: true, runValidators: true }
    )
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }
    return res.status(200).json(employee)
  } catch (err) {
    next(err)
  }
}

export const deleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eid = req.query.eid
    if (typeof eid !== 'string' || !isValidObjectId(eid)) {
      return res.status(400).json({ message: 'Invalid employee id' })
    }

    const employee = await Employee.findOneAndDelete({ _id: eid, user: req.user!.id })
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }
    return res.status(204).send()
  } catch (err) {
    next(err)
  }
}
