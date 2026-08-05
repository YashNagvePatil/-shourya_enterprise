import dotenv from 'dotenv'
dotenv.config()

 if (!process.env.MONGO_URI){
    throw new Error ("MONOG_URI is not decleared")
 }


 if (!process.env.JWT_SECRET){
   throw new Error("JWT_SECRET is not decleared")
 }
 
 export const config = {
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET,
 }