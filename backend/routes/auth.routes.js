import {Router} from "express"
import { login, register } from "../controllers/auth.controller.js"
import { validateLogin, validateRegister } from "../validators/auth.validator.js"
const router = Router()

router.post("/register",validateRegister,register)
router.post("/login",validateLogin,login)



export default router