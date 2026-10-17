import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import logger from '../utils/logger'

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body

    // Username and email must both be unique
    const existing = await User.findOne({ $or: [{ username }, { email }] })
    if (existing) {
      logger.warn(`SIGNUP rejected (duplicate) username=${username}`)
      return res.status(409).json({ message: 'Username or email already in use' })
    }

    // Only the hash is stored, never the plain password
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ username, email, password: hashed })
    logger.info(`SIGNUP success userId=${user._id}`)

    // Send back only safe fields, never the password hash
    return res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
    })
  } catch (err) {
    next(err)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body

    // Users can log in with either their email or their username.
    // The password is hidden by default (select: false in the model), so ask for it here.
    const filter = email ? { email } : { username }
    const user = await User.findOne(filter).select('+password')

    // Same answer for "no such user" and "wrong password",
    // so nobody can use login to find out which accounts exist
    const passwordMatches = user ? await bcrypt.compare(password, user.password) : false
    if (!user || !passwordMatches) {
      logger.warn(`LOGIN failed identifier=${email ?? username}`)
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET is not set')

    // The token only holds the user's id, and expires after 1 hour
    const token = jwt.sign({ id: user._id.toString() }, secret, { expiresIn: '1h' })

    logger.info(`LOGIN success userId=${user._id}`)
    return res.status(200).json({ message: 'Login successful', token })
  } catch (err) {
    next(err)
  }
}
