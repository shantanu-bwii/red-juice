import mongoose from 'mongoose'


const connectDb = async ()=>{
    try{
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`Connected to mongodb ${mongoose.connection.host}`);
    }catch(error){
     console.log(`Mongo eror ${error}`);
    }
}
export default connectDb;