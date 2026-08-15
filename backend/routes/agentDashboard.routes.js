import{ Router} from "express"
import { dashBoard, getWalletDetails, netWorkTree } from "../controllers/agent.controller.js"
import {authenticateUser} from "../middlewares/agent.middleware.js"
const router = Router()

/**
 * @route   POST/api/agents/dashBoard
 * @description fetch agent  data from database
 * @access private(agent only)
 */


router.get("/dashBoard",authenticateUser,dashBoard)

/**
 * @route GET/api/agents/networkTree
 * @description fetching logged in user childs data 
 * @access private(agent only)
 * 
 */


router.get("/networkTree",authenticateUser,netWorkTree)

/**
 * @route GET/api/agents/wallet
 * @description fetching logged in user wallet details 
 * @access private(agent only)
 * 
 */

router.get("/wallet",authenticateUser,getWalletDetails)






export default router