import{ Router} from "express"
import { addToCart, dashBoard, getCart, getWalletDetails, netWorkTree, removeFromCart } from "../controllers/agent.controller.js"
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



router.get("/getCart", authenticateUser, getCart);

// 2. Add / Update Item in Cart
router.post("/addCart", authenticateUser, addToCart);

// 3. Remove Item from Cart (productId param zaroori hai)
router.delete("/:productId", authenticateUser, removeFromCart);

export default router