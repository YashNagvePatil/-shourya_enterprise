import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { config } from "../config/config.js";
import userModel from "../models/user.models.js";
import adminModel from "../models/admin.model.js";
import franchiseModel from "../models/franchise.model.js";
import redis from "../config/cacheRedis.js";

/**
 * Enterprise Level Authentication & Role Resolution Middleware with Redis Session Caching
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

    const userId = decoded.id;
    const roleUpper = decoded.role ? decoded.role.toUpperCase() : "USER";
    const cacheKey = `user_session:${userId}`;
    let user = null;

    // 4. Check Redis Cache First (Avoids repetitive DB lookups on every single request)
    if (redis.status === "ready") {
      try {
        const cachedUser = await redis.get(cacheKey);
        if (cachedUser) {
          user = JSON.parse(cachedUser);
        }
      } catch (redisErr) {
        console.warn("⚠️ [AUTH REDIS GET WARNING]:", redisErr.message);
      }
    }

    // 5. Database Lookup if Cache Miss
    if (!user) {
      if (roleUpper === "ADMIN") {
        user = await adminModel.findById(userId).select("-password").lean();
      } else if (roleUpper === "FRANCHISE") {
        user = await franchiseModel.findById(userId).select("-password").lean();
      } else {
        user = await userModel.findById(userId).select("-password").lean();
      }

      // Save user to Redis for 180 seconds (3 minutes)
      if (user && redis.status === "ready") {
        redis.setex(cacheKey, 180, JSON.stringify(user)).catch((err) => {
          console.warn("⚠️ [AUTH REDIS SET WARNING]:", err.message);
        });
      }
    }

    // 6. User Existence Check
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized! User session no longer exists.",
      });
    }

    // 7. Account Status Checks
    const statusUpper = user.status ? user.status.toUpperCase() : "ACTIVE";

    if (["BLOCKED", "INACTIVE", "REJECTED", "SUSPENDED"].includes(statusUpper)) {
      return res.status(403).json({
        success: false,
        message: `Your account status is ${user.status}. Access restricted.`,
      });
    }

    // 8. Attach Safe User Payload & Context
    req.user = {
      ...user,
      id: (user._id || userId).toString(),
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