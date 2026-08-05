import express from "express"
import morgan from "morgan"
import cookieParser from "cookie-parser"


const app = express()

 app.use(morgan("dev"))
 app.use(express.json());
 app.use(express.urlencoded({extended:true}))
 app.use(cookieParser());

  app.get('/',(req,res) => {
    res.send("Hello World!");
 })

  export default app