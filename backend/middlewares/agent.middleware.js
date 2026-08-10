import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import userModel from "../models/user.model.js";

export const authenticateAgent = async (req, res, next) => {
  try {
    // 1. get token from cookie 
    let token = req.cookies?.token;

    // Fallback: Postman testing  Headers check (Optional but Helpful)
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. Token missing check
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Denied! No token provided.",
      });
    }

    // 3. Token verify 
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // 4. User fetch  (Password exclude ) -> FIXED: findById
    const user = await userModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized! User no longer exists.",
      });
    }

    // 5. Blocked Account Check (MLM Safety)
    if (user.status === "Blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked. Please contact support.",
      });
    }

    // 6.  user attach in Request object
    req.user = user;
    next();
  } catch (error) {
    console.error("[AUTH MIDDLEWARE ERROR]:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
    });
  }
};