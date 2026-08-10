import{ Router} from "express"
import { dashBoard } from "../controllers/agentDashboard.controller.js"
import {authenticateAgent} from "../middlewares/agent.middleware.js"
const router = Router()

/**
 * @route   POST/ /agents/dashBoard
 * @description fetch agent  data from database
 * @access private(agent only)
 */


router.get("/dashBoard/:agentDbId",authenticateAgent,dashBoard)


export default router