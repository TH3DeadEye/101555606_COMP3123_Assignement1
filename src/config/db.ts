import mongoose from 'mongoose';

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI as string);
    }catch (e) {
        throw new Error(`Error connecting to MongoDB: ${e}`);
    }

}
export default connectDB;
