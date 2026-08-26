import { Router } from "express";
import { verifyAndDistributeMLM } from "../controllers/payment.controller.js";
import { authenticateUser } from "../middlewares/agent.middleware.js";


const router = Router()

 router.post("/payment",authenticateUser,verifyAndDistributeMLM)

 
 export default router