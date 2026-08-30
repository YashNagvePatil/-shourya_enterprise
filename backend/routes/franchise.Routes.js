import Router from "express"
import { getFinancialOverview, getFranchiseProfile, getInventory,
     getSupplyRequestsForHierarchy, registerFranchise, 
     sellFromInventory,createSupplyRequest, 
     loginFranchise,
     getDashboardAnalytics,
     updateFranchiseProfile,
     changeFranchisePassword} from "../controllers/franchise.controller.js";
import { authenticateUser } from "../middlewares/agent.middleware.js";
import { getFranchiseFinancialOverview ,getFranchisePassbook,getFranchiseAnalytics,
     requestWithdrawal,cancelWithdrawal
 } from "../controllers/franchise.controller.js";

 const router = Router()

// Public Registration
router.post("/register",registerFranchise);

router.post("/login",loginFranchise)
// Protected Franchise Dashboard Routes
router.use(authenticateUser);

// Profile & Dashboard Financial Details
router.get("/profile", getFranchiseProfile);
router.get("/financials", getFinancialOverview);
router.get("/analytics",getDashboardAnalytics)
// Supply Requests (Hierarchy Flow)

// dedicated profile page 

router.put("/profile/update",updateFranchiseProfile)

router.put("/profile/change-password",changeFranchisePassword)


router.post("/create-supply-request",createSupplyRequest);
router.get("/get-supply-requests", getSupplyRequestsForHierarchy);


// finance 

router.get("/financials/overview", getFranchiseFinancialOverview)
router.get("/financials/passbook", getFranchisePassbook);
router.get("/financials/analytics", getFranchiseAnalytics);
router.post("/financials/withdraw", requestWithdrawal);
router.post("/financials/withdraw/cancel", cancelWithdrawal);



// Inventory & Direct Sales Operations
router.get("/inventory",getInventory);
router.post("/inventory/sell",sellFromInventory);

export default router