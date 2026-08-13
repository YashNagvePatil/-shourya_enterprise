import{ Router} from "express"
import { dashBoard, getWalletDetails, netWorkTree } from "../controllers/agentDashboard.controller.js"
import {authenticateAgent} from "../middlewares/agent.middleware.js"
const router = Router()

/**
 * @route   POST/api/agents/dashBoard
 * @description fetch agent  data from database
 * @access private(agent only)
 */


router.get("/dashBoard",authenticateAgent,dashBoard)

/**
 * @route GET/api/agents/networkTree
 * @description fetching logged in user childs data 
 * @access private(agent only)
 * 
 */


router.get("/networkTree",authenticateAgent,netWorkTree)

/**
 * @route GET/api/agents/wallet
 * @description fetching logged in user wallet details 
 * @access private(agent only)
 * 
 */

router.get("/wallet",authenticateAgent,getWalletDetails)


export default router