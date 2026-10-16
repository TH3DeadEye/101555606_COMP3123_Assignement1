import { z } from 'zod'

const name = (label: string) =>
  z.string().trim().min(1, `${label} is required`).max(50, `${label} must be at most 50 characters`)

export const createEmployeeSchema = z.object({
  first_name: name('First name'),
  last_name: name('Last name'),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email('Invalid email address')),
  position: z.string().trim().min(1, 'Position is required').max(100),
  salary: z.number('Salary must be a number').positive('Salary must be greater than 0').max(1_000_000_000),
  date_of_joining: z.coerce.date('Invalid date'),
  department: z.string().trim().min(1, 'Department is required').max(100),
})

// Update: any subset of the fields, but at least one.
export const updateEmployeeSchema = createEmployeeSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Provide at least one field to update' })

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee id')

export const eidParamSchema = z.object({ eid: objectId })
export const eidQuerySchema = z.object({ eid: objectId })
