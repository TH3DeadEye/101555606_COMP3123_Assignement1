import { Schema, model, Types } from 'mongoose'

export interface IEmployee {
  first_name: string
  last_name: string
  email: string
  position: string
  salary: number
  date_of_joining: Date
  department: string
  user: Types.ObjectId
  created_at: Date
  updated_at: Date
}

const employeeSchema = new Schema<IEmployee>(
  {
    first_name: { type: String, required: true, trim: true, maxlength: 50 },
    last_name: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, lowercase: true, trim: true },
    position: { type: String, required: true, trim: true, maxlength: 100 },
    salary: { type: Number, required: true, min: 0 },
    date_of_joining: { type: Date, required: true },
    department: { type: String, required: true, trim: true, maxlength: 100 },
    // The owner. Set from the JWT on creation, never from the request body.
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

export default model<IEmployee>('Employee', employeeSchema)
