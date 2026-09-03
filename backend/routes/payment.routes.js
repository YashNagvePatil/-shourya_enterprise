import { Router } from "express";
import { verifyAndDistributeMLM,createRazorpayOrder } from "../controllers/payment.controller.js";
import { authenticateUser } from "../middlewares/agent.middleware.js";


const router = Router()

// Step 1: Create Razorpay Order
router.post("/create-order", authenticateUser, createRazorpayOrder);

// Step 2: Verify Razorpay Signature & Distribute MLM Points
router.post("/verify-and-distribute", authenticateUser, verifyAndDistributeMLM);

 
 export default router