import { Schema, model } from 'mongoose'

export interface IUser {
  username: string
  email: string
  password: string
  created_at: Date
  updated_at: Date
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String, 
      required: true, 
      unique: true, trim: 
      true, minlength: 3, 
      maxlength: 30 
    },

    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { 
      type: String, 
      required: true, 
      select: false 
    },
  },
  { timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  } 
})

export default model<IUser>('User', userSchema)
