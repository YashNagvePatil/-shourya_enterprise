import { Router } from "express";
import { deductItemStock, getAdminAgentAnalytics,getAgentById, getAgentsList, getInventoryItem, purchaseItem, toggleAgentStatus,} from "../controllers/admin.controller.js";
import { authenticateUser } from "../middlewares/agent.middleware.js";
import { createProduct} from "../controllers/product.controller.js";
import {getDashboardOverview,getNetworkAnalytics} from "../controllers/franchiseMangment/franchiseMangeDashboard.controller.js"
import {getPendingApplications,reviewApplication,getFranchiseHierarchy,updateFranchiseStatus} from "../controllers/franchiseMangment/franchiseMangement.controller.js"
import {getGlobalSupplyRequests,updateSupplyDispatchStatus} from "../controllers/franchiseMangment/adminSupply.Controller.js"
import {getFinancialSummary, processSettlement,reviewWithdrawalRequest,getFranchiseFinancialLedger} from "../controllers/franchiseMangment/adminFinaclials.controller.js"

const router = Router()


/**
 * @desc    Get complete Agent Analytics & Metrics for Admin Dashboard
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin Only)
 */
   router.use(authenticateUser)

  router.get("/dashboard",getAdminAgentAnalytics)

/**
 * @desc    Get all agents with search, filters & pagination
 * @route   GET /api/admin/agents
 * @access  Private (Admin Only)
 */

  router.get("/agent/management",getAgentsList)


  /**
   * @desc GET specifice agent details 
   * @route GET 
   */


  router.get("/agent/:id",getAgentById)
 
  router.patch("/agent/status/:id",toggleAgentStatus)

  router.post("/createProduct",createProduct)


 /**
 * @desc    Sell / Deduct Item Stock from Inventory
 * @route   POST /api/inventory/deduct
 * @access  Private/Admin
 */

  router.post("/inventory/purchase",purchaseItem)

  /**
   * @desc    Sell / Deduct Item Stock from Inventory
   * @route   POST /api/inventory/deduct
   * @access  Private/Admin
   */

  router.post("/inventory/deduct",deductItemStock)

   /**
    * @desc    Get Current Inventory Details by ID
    * @route   GET /api/inventory/:itemId
    * @access  Private
    */


  router.get("/inventory/:itemId",getInventoryItem)


  // franchise management controllers 

  // Dashboard & Analytics
router.get("/dashboard/overview", getDashboardOverview);
router.get("/dashboard/analytics", getNetworkAnalytics);

// Franchise & Onboarding Management
router.get("/applications/pending", getPendingApplications);
router.patch("/applications/:franchiseId/review", reviewApplication);
router.get("/franchises/hierarchy", getFranchiseHierarchy);
router.patch("/franchises/:franchiseId/status", updateFranchiseStatus);

// Supply Management
router.get("/supplies", getGlobalSupplyRequests);
router.patch("/supplies/:requestId/status", updateSupplyDispatchStatus);

// Financials & Settlements
router.get("/financials/summary", getFinancialSummary);
router.post("/financials/settle", processSettlement);

router.patch("/financials/withdrawal/:requestId", reviewWithdrawalRequest);
router.get("/financials/ledger/:franchiseId", getFranchiseFinancialLedger);



export default router