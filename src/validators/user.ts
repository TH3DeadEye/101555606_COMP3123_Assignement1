import { z } from 'zod'

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters') // bcrypt ignores anything past 72 bytes
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')

export const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers and underscores'),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email('Invalid email address')),
  password,
})

// Login: username OR email, plus password. (No strength rules here, just "is it present".)
export const loginSchema = z
  .object({
    username: z.string().trim().min(1).max(30).optional(),
    email: z.string().trim().toLowerCase().max(254).pipe(z.email('Invalid email address')).optional(),
    password: z.string().min(1, 'Password is required').max(72),
  })
  .refine((data) => data.username !== undefined || data.email !== undefined, {
    message: 'Provide username or email',
    path: ['username'],
  })
