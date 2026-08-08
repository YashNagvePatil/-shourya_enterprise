import express from "express"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import authRouter from "../routes/auth.routes.js"

const app = express()

 app.use(morgan("dev"))
 app.use(express.json());
 app.use(express.urlencoded({extended:true}))
 app.use(cookieParser());

  app.get('/',(req,res) => {
    res.send("Hello World!");
 })

 app.use("/api/auth",authRouter)

  export default app