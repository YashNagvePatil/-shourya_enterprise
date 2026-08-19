import { Router } from "express";
import { getAdminDashboardData, getAgentById, getAgentsList, toggleAgentStatus,} from "../controllers/admin.controller.js";
import { authenticateUser } from "../middlewares/agent.middleware.js";
import { createProduct} from "../controllers/product.controller.js";


const router = Router()


/**
 * @desc    Get complete Agent Analytics & Metrics for Admin Dashboard
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin Only)
 */


  router.get("/dashboard",authenticateUser,getAdminDashboardData)

/**
 * @desc    Get all agents with search, filters & pagination
 * @route   GET /api/admin/agents
 * @access  Private (Admin Only)
 */

  router.get("/agent/management",authenticateUser,getAgentsList)


  /**
   * @desc GET specifice agent details 
   * @route GET 
   */


  router.get("/agent/:id",authenticateUser,getAgentById)
 


  router.patch("/agent/status/:id",authenticateUser,toggleAgentStatus)

  router.post("/createProduct",authenticateUser,createProduct)

export default router