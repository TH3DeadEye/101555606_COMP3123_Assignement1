import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db'
import app from './app'

dotenv.config()

connectDB()


app.listen(3000)