import Router from "express"
import  franchiseController from"../controllers/franchiseController"
import  protectFranchise  from "../middlewares/authMiddleware"


 const router = Router()

// Public Registration
router.post("/register", franchiseController.registerFranchise);

// Protected Franchise Dashboard Routes
router.use(protectFranchise);

// Profile & Dashboard Financial Details
router.get("/profile", franchiseController.getFranchiseProfile);
router.get("/financials", franchiseController.getFinancialOverview);

// Supply Requests (Hierarchy Flow)
router.post("/supply-request", franchiseController.createSupplyRequest);
router.get("/supply-requests", franchiseController.getSupplyRequestsForHierarchy);

// Inventory & Direct Sales Operations
router.get("/inventory", franchiseController.getInventory);
router.post("/inventory/sell", franchiseController.sellFromInventory);

export default router