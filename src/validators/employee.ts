import { z } from 'zod'

export const createEmployeeSchema = z.object({
  first_name: z.string('First name is required').trim().min(1, 'First name is required').max(50),
  last_name: z.string('Last name is required').trim().min(1, 'Last name is required').max(50),
  email: z.email('Invalid email address').toLowerCase(),
  position: z.string('Position is required').trim().min(1, 'Position is required').max(100),
  salary: z.number('Salary must be a number').positive('Salary must be greater than 0'),
  date_of_joining: z.iso.date('Date of joining must be a valid date (YYYY-MM-DD)'),
  department: z.string('Department is required').trim().min(1, 'Department is required').max(100),
})

// For updates every field is optional, but at least one has to be sent
export const updateEmployeeSchema = createEmployeeSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Provide at least one field to update' }
)

// Used for both /employees/:eid (params) and /employees?eid=xxx (query).
// MongoDB ids are 24 hexadecimal characters.
export const eidSchema = z.object({
  eid: z.string('Employee id is required').regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee id'),
})
