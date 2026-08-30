import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { config } from "../config/config.js";
import userModel from "../models/user.models.js";
import adminModel from "../models/admin.model.js";
import franchiseModel from "../models/franchise.model.js";

/**
 * Enterprise Level Authentication & Role Resolution Middleware
 */
export const authenticateUser = async (req, res, next) => {
  try {
    // 1. Token Retrieval (Cookie or Authorization Header)
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. Missing Token Guard
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Denied! Authorization token missing.",
      });
    }

    // 3. Verify JWT Payload
    const decoded = jwt.verify(token, config.JWT_SECRET);

    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload structure.",
      });
    }

    // 4. Optimized Model Lookup via Lean Queries
    let user = null;
    const roleUpper = decoded.role ? decoded.role.toUpperCase() : "USER";

    if (roleUpper === "ADMIN") {
      user = await adminModel.findById(decoded.id).select("-password").lean();
    } else if (roleUpper === "FRANCHISE") {
      user = await franchiseModel.findById(decoded.id).select("-password").lean();
    } else {
      user = await userModel.findById(decoded.id).select("-password").lean();
    }

    // 5. User Existence Check
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized! User session no longer exists.",
      });
    }

    // 6. Account Status Checks
    const statusUpper = user.status ? user.status.toUpperCase() : "ACTIVE";

    if (["BLOCKED", "INACTIVE", "REJECTED", "SUSPENDED"].includes(statusUpper)) {
      return res.status(403).json({
        success: false,
        message: `Your account status is ${user.status}. Access restricted.`,
      });
    }

    if (statusUpper === "PENDING") {
      return res.status(403).json({
        success: false,
        message: "Your account verification is pending Admin approval.",
      });
    }

    // 7. Attach Safe User Payload & Context (Ensuring standard .id & ._id)
    req.user = {
      ...user,
      id: user._id.toString(),
      role: decoded.role || user.role || "FRANCHISE",
    };

    next();
  } catch (error) {
    // Specific JWT Error Handling for Frontend Refresh Token logic
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
        isExpired: true,
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token signature.",
      });
    }

    console.error("[AUTH MIDDLEWARE CRITICAL ERROR]:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Authentication System Failure.",
    });
  }
};