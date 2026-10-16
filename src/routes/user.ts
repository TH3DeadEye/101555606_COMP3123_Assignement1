import express from 'express'
import { signup, login } from '../controllers/user'

const user_router = express.Router()

user_router.post('/signup', signup)
user_router.post('/login', login)

export default user_router
