import { z } from 'zod'

export const signupSchema = z.object({
  username: z
    .string('Username is required')
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
  email: z.email('Invalid email address').toLowerCase(),
  password: z
    .string('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters') // bcrypt only uses the first 72 bytes
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
})

// Login works with either a username or an email, plus the password
export const loginSchema = z
  .object({
    username: z.string().trim().min(1).optional(),
    email: z.email('Invalid email address').toLowerCase().optional(),
    password: z.string('Password is required').min(1, 'Password is required'),
  })
  .refine((data) => data.username || data.email, {
    message: 'Provide a username or an email',
    path: ['username'],
  })
