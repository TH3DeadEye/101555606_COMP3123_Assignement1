import mongoose from 'mongoose';
require('dotenv').config();
const connectDB = async () => {
    try{
        const connection = await mongoose.connect(process.env.MONGODB_URI as string);
    }catch (e) {
        throw new Error(`Error connecting to MongoDB: ${e}`);
    }

}
export default connectDB;