import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import logger from '../utils/logger'

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body

    const existing = await User.findOne({ $or: [{ username }, { email }] })
    if (existing) {
      logger.warn(`SIGNUP rejected (duplicate) username=${username}`)
      return res.status(409).json({ message: 'Username or email already in use' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ username, email, password: hashed })
    logger.info(`SIGNUP success userId=${user._id}`)

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

    if (typeof password !== 'string' || (typeof username !== 'string' && typeof email !== 'string')) {
      return res.status(400).json({ message: 'Provide username or email, and password' })
    }

    const query = typeof email === 'string' ? { email: email.toLowerCase().trim() } : { username }
    const user = await User.findOne(query).select('+password')

    const valid = user ? await bcrypt.compare(password, user.password) : false
    if (!user || !valid) {
      logger.warn(`LOGIN failed identifier=${email ?? username}`)
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET is not set')

    const token = jwt.sign({ id: user._id.toString() }, secret, { expiresIn: '1h' })

    logger.info(`LOGIN success userId=${user._id}`)
    return res.status(200).json({ message: 'Login successful', token })
  } catch (err) {
    next(err)
  }
}
