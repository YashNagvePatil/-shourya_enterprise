import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import userModel from "../models/user.models.js";
import adminModel from "../models/admin.model.js";
import franchiseModel from "../models/franchise.model.js";

export const authenticateUser = async (req, res, next) => {
  try {
    // 1. Get token from cookie or Authorization header
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. Missing token check
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Denied! No token provided.",
      });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // 4. Dynamic Model Selection based on Role in Token
    let user = null;
    const roleUpper = decoded.role ? decoded.role.toUpperCase() : "";

    if (roleUpper === "ADMIN") {
      user = await adminModel.findById(decoded.id).select("-password");
    } else if (roleUpper === "FRANCHISE") {
      user = await franchiseModel.findById(decoded.id).select("-password");
    } else {
      user = await userModel.findById(decoded.id).select("-password");
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized! Account no longer exists.",
      });
    }

    // 5. Account Status & Access Check
    if (user.status === "Blocked" || user.status === "Inactive" || user.status === "Rejected") {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.status.toLowerCase()}. Please contact support.`,
      });
    }

    if (user.status === "Pending") {
      return res.status(403).json({
        success: false,
        message: "Your account verification is pending Admin approval.",
      });
    }

    // 6. Attach resolved user profile and decoded token metadata
    req.user = user;
    req.user.role = decoded.role || "FRANCHISE";
    
    next();
  } catch (error) {
    console.error("[AUTH MIDDLEWARE ERROR]:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
    });
  }
};