import Router from "express"
import { getFinancialOverview, getFranchiseProfile, getInventory,
     getSupplyRequestsForHierarchy, registerFranchise, 
     sellFromInventory,createSupplyRequest, 
     loginFranchise} from "../controllers/franchise.controller.js";
import { authenticateUser } from "../middlewares/agent.middleware.js";


 const router = Router()

// Public Registration
router.post("/register",registerFranchise);

router.post("/login",loginFranchise)
// Protected Franchise Dashboard Routes
router.use(authenticateUser);

// Profile & Dashboard Financial Details
router.get("/profile", getFranchiseProfile);
router.get("/financials", getFinancialOverview);

// Supply Requests (Hierarchy Flow)
router.post("/create-supply-request",createSupplyRequest);
router.get("/get-supply-requests", getSupplyRequestsForHierarchy);

// Inventory & Direct Sales Operations
router.get("/inventory",getInventory);
router.post("/inventory/sell",sellFromInventory);

export default router