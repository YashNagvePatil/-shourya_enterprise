import express from "express"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import authRouter from "../routes/auth.routes.js"
import agentRouter from "../routes/agentDashboard.routes.js"
import adminRouter from "../routes/admin.Routes.js"
import productRouter from "../routes/product.routes.js"
// import payMentRouter from "../routes/payment.routes.js"
import franchiseRouter from "../routes/franchise.Routes.js"
import cors from "cors"
const app = express()

 app.use(morgan("dev"))
 app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
 app.use(cookieParser());


 app.use(cors({
  origin:"http://localhost:5173",
  methods:["GET","POST","PUT","DELETE","PATCH"],
  credentials:true
 }))

  app.get('/',(req,res) => {
    res.send("Hello World!");
 })

 

 app.use("/api/auth",authRouter)
 app.use("/api/agent",agentRouter)
 app.use("/api/admin",adminRouter)
 app.use("/api/home",productRouter)
//  app.use("/api",payMentRouter)
 app.use("/api/franchise",franchiseRouter)

 export default app