import mongoose from "mongoose"
import { config } from "../config/config.js"

    const connectTodb = async  () =>{
   
        await mongoose.connect(config.MONGO_URI)
        console.log("mongoDb connected")

    }

     export default connectTodb