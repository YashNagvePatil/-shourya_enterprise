import express from "express"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import authRouter from "../routes/auth.routes.js"
import agentRouter from "../routes/agentDashboard.routes.js"
import cors from "cors"
const app = express()

 app.use(morgan("dev"))
 app.use(express.json());
 app.use(express.urlencoded({extended:true}))
 app.use(cookieParser());

  app.get('/',(req,res) => {
    res.send("Hello World!");
 })

 app.use(cors({
  origin:"http://localhost:5173",
  methods:["GET","POST","PUT","DELETE"],
  credentials:true
 }))

 app.use("/api/auth",authRouter)
 app.use("/api/agent",agentRouter)

  export default app