import{ Router} from "express"
import { dashBoard, netWorkTree } from "../controllers/agentDashboard.controller.js"
import {authenticateAgent} from "../middlewares/agent.middleware.js"
const router = Router()

/**
 * @route   POST/ /agents/dashBoard
 * @description fetch agent  data from database
 * @access private(agent only)
 */


router.get("/dashBoard",authenticateAgent,dashBoard)
router.get("/networkTree",authenticateAgent,netWorkTree)
router.get("/wallet",authenticateAgent,)


export default router