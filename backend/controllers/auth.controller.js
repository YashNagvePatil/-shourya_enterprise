import userModel from "../models/user.models.js";
import { FRANCHISE_TYPES } from "../models/franchise.model.js";
import { config } from "../config/config.js";
import jwt from "jsonwebtoken";
import { uploadMultipleToCloudinary } from "../services/storage.service.js";
import * as authDao from "../dao/auth.dao.js"

 export async function sendTokenResponse(user, res, message, statusCode = 200) {
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role || "FRANCHISE",
      franchiseType: user.franchiseType || null,
      address: user.address || null,
    },
    config.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Set HTTP-Only Cookie (Exact original configuration retained)
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return res.status(statusCode).json({
    message,
    success: true,
    token, // Sent in body for mobile/header authorization flexibility
    user: {
      id: user._id,
      email: user.email,
      contact: user.contact || user.mobile,
      fullName: user.fullName,
      role: user.role || "FRANCHISE",
      // Franchise Panel specific fields
      ...(user.franchiseType && { franchiseType: user.franchiseType }),
      ...(user.address && { address: user.address }),
      ...(user.status && { status: user.status }),
      // Agent Panel specific fields
      ...(user.distributerId && { distributerId: user.distributerId }),
      ...(user.parentAgentName || user.parrentAgentName
        ? { parentAgentName: user.parentAgentName || user.parrentAgentName }
        : {}),
      ...(user.parentAgentId && { parentAgentId: user.parentAgentId }),
    },
  });
}
// Uniqe Agent Id Genrator Safety Net

async function genrateUniqueDistributerId() {
  let uniqueId = "";
  let exists = true;

  // loop for finding uniq id

  while (exists) {
    uniqueId = `AGT${Math.floor(100000 + Math.random() * 900000)}`;
    const user = await userModel.findOne({ distributerId: uniqueId });
    if (!user) exists = false;
  }
  return uniqueId;
}

// --- Register Controller ---

/**
 
 */
/**
 * Binary Tree Traversal Helper
 * Sub-tree me Deepest Vacant Slot Search karne ke liye (Breadth-First Search)
 */
/**
 * Helper: Find Deepest Vacant Slot (BFS Algorithm for Spillover)

/**
 * Spillover BFS Algorithm to find the deepest vacant slot
 */
const findDeepestVacantSlot = async (startAgentId, targetLeg) => {
  let queue = [{ agentId: startAgentId, leg: targetLeg }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current?.agentId) continue;

    const currentAgent = await authDao.findParentByDistributorId(current.agentId);
    if (!currentAgent) continue;

    // Check Left Leg Slot
    if (current.leg === "left") {
      if (!currentAgent.leftChild) {
        return { parent: currentAgent, position: "left" };
      }
      const leftDistId = currentAgent.leftChild?.distributerId || currentAgent.leftChild?.distributorId;
      if (leftDistId) {
        queue.push({ agentId: leftDistId, leg: "left" });
        queue.push({ agentId: leftDistId, leg: "right" });
      }
    }

    // Check Right Leg Slot
    if (current.leg === "right") {
      if (!currentAgent.rightChild) {
        return { parent: currentAgent, position: "right" };
      }
      const rightDistId = currentAgent.rightChild?.distributerId || currentAgent.rightChild?.distributorId;
      if (rightDistId) {
        queue.push({ agentId: rightDistId, leg: "left" });
        queue.push({ agentId: rightDistId, leg: "right" });
      }
    }
  }

  return null;
};

/**
 * Register Controller
 */
export const register = async (req, res) => {
  const {
    email,
    contact,
    password,
    fullName,
    role,
    parentAgentId,
    sponsorId,
    parrentAgentName,
    position,
    panCardImage,
    adharCardImage,
  } = req.body || {};

  console.log(`[DEBUG] Registration Attempt for: ${email || "N/A"} | Role: ${role || "N/A"}`);

  try {
    // 1. Mandatory Text Fields Validation
    if (!email || !contact || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Please fill all mandatory fields (Name, Email, Contact, Password)",
      });
    }

    // 2. Mandatory Images Validation
    if (!panCardImage || !adharCardImage) {
      return res.status(400).json({
        success: false,
        message: "Both PAN Card and Aadhaar Card images are required!",
      });
    }

    // Safe string operations (Prevents runtime crash if non-string values passed)
    const cleanEmail = String(email).toLowerCase().trim();
    const cleanFullName = String(fullName).trim();

    // 3. Duplicate Account Check
    const existingUser = await authDao.findExistingUserByEmailOrContact(
      cleanEmail,
      contact
    );

    if (existingUser) {
      console.warn(`[DEBUG] Duplicate User Blocked: ${cleanEmail} / ${contact}`);
      return res.status(400).json({
        success: false,
        message: "Email or Contact number already registered!",
      });
    }

    // 4. Cloudinary Concurrent Uploads
    const uploadResults = await uploadMultipleToCloudinary(
      [panCardImage, adharCardImage],
      "kyc_documents"
    );

    const panCardImageUrl = uploadResults[0]?.url || uploadResults[0]?.secure_url || "";
    const adharCardImageUrl = uploadResults[1]?.url || uploadResults[1]?.secure_url || "";

    let parentUser = null;
    let sponsorUser = null;
    let finalPlacementPosition = null;

    const isTargetAgent = role !== "Admin";

    if (isTargetAgent) {
      const totalAgentCount = await authDao.getAgentCount();

      if (totalAgentCount === 0) {
        console.log("[DEBUG] No agents in DB. Creating First Root Agent...");
        parentUser = null;
        sponsorUser = null;
        finalPlacementPosition = null;
      } else {
        const targetSponsorId = sponsorId || parentAgentId;

        if (!targetSponsorId) {
          return res.status(400).json({
            success: false,
            message: "Sponsor ID or Parent ID is required for registration!",
          });
        }

        // Fetch Sponsor Node Details
        sponsorUser = await authDao.findParentByDistributorId(targetSponsorId);

        if (!sponsorUser) {
          console.warn(`[DEBUG] Invalid Sponsor ID: ${targetSponsorId}`);
          return res.status(404).json({
            success: false,
            message: "Invalid Sponsor ID! Sponsor Agent does not exist.",
          });
        }

        const requestedLeg = position === "right" ? "right" : "left";

        // Check direct slot occupation
        const isDirectSlotOccupied = await authDao.checkSlotOccupation(
          sponsorUser._id,
          requestedLeg
        );

        if (!isDirectSlotOccupied) {
          parentUser = sponsorUser;
          finalPlacementPosition = requestedLeg;
          console.log(
            `[PLACEMENT DIRECT] Placed directly under Sponsor ${sponsorUser.distributerId || sponsorUser.distributorId} on ${finalPlacementPosition}`
          );
        } else {
          console.log(
            `[PLACEMENT SPILLOVER] ${requestedLeg.toUpperCase()} leg occupied under ${sponsorUser.distributerId || sponsorUser.distributorId}. Searching for deepest vacant slot...`
          );

          const vacantSlot = await findDeepestVacantSlot(
            sponsorUser.distributerId || sponsorUser.distributorId,
            requestedLeg
          );

          if (!vacantSlot || !vacantSlot.parent) {
            return res.status(400).json({
              success: false,
              message: "Unable to find a vacant slot in the selected leg.",
            });
          }

          parentUser = vacantSlot.parent;
          finalPlacementPosition = vacantSlot.position;

          console.log(
            `[PLACEMENT SPILLOVER SUCCESS] Sponsor: ${sponsorUser.distributerId || sponsorUser.distributorId} | Auto-placed under Immediate Parent: ${parentUser.distributerId || parentUser.distributorId} (${finalPlacementPosition})`
          );
        }
      }
    }

    // 5. Generate Distributor ID
    const newDistributedId = await genrateUniqueDistributerId();
    console.log(`[DEBUG] New Agent ID Generated: ${newDistributedId}`);

    // 6. Assemble Payload Schema
    const agentPayload = {
      email: cleanEmail,
      contact,
      password,
      fullName: cleanFullName,
      panCardImage: panCardImageUrl,
      adharCardImage: adharCardImageUrl,
      distributerId: newDistributedId,
      role: role === "Admin" ? "Admin" : "Agent",
      position: role === "Admin" ? null : finalPlacementPosition,
      parentAgentId: parentUser ? parentUser._id : null,

      sponserId: sponsorUser ? (sponsorUser.distributerId || sponsorUser.distributorId || "DIRECT") : "DIRECT",
      sponserName: sponsorUser ? (sponsorUser.fullName || "system") : "system",
      parrentAgentName: parentUser
        ? (parentUser.fullName || "system")
        : (parrentAgentName || "system"),

      leftBV: 0,
      rightBV: 0,
      totalLeftBV: 0,
      totalRightBV: 0,
      walletBalance: 0,
      totalMatchingBonus: 0,
      totalDirectBonus: 0,
      totalEarning: 0,
      totalWithdrawn: 0,
      pendingPayout: 0,
      leftChild: null,
      rightChild: null,
      totalDirects: 0,
      totalLeftAgents: 0,
      totalRightAgents: 0,
      activeLeftAgents: 0,
      activeRightAgents: 0,
    };

    // 7. Save to Database
    const user = await authDao.createAgentRecord(agentPayload);
    console.log(`[DEBUG] Registration Successful! Created User ID: ${user._id}`);

    // 8. Update Tree Relationships and Uplines
    if (role !== "Admin" && parentUser) {
      console.log(
        `[TREE UPDATE] Processing network updates under immediate parent ID: ${parentUser.distributerId || parentUser.distributorId}`
      );

      await authDao.updateParentChildSlot(
        parentUser._id,
        finalPlacementPosition,
        user._id
      );

      if (user.sponserId && user.sponserId !== "DIRECT") {
        await authDao.incrementSponsorDirectCount(user.sponserId);
      }

      await authDao.updateAllUplinesCounters(
        parentUser._id,
        finalPlacementPosition,
        0 // initialJoiningBV
      );

      console.log(`[TREE UPDATE] All uplines synced completely.`);
    }

    return await sendTokenResponse(user, res, "Registration Successful!");
  } catch (error) {
    console.error(`[CRITICAL ERROR] Registration Failed: ${error.stack || error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error during registration",
    });
  }
};

// --- Login Controller ---

export const login = async (req, res) => {
  try {
    console.log("[DEBUG] Login Payload Received:", req.body);

    // Supporting both single-field identifiers or legacy distributor parameters safely
    const { identifier, distributerId, password } = req.body;
    const inputId = (identifier || distributerId || "").trim();

    // 1. Input Validation Guard
    if (!inputId || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide Email / Agent ID / Contact Number and Password",
      });
    }

    const cleanInput = inputId.toLowerCase();

    // 2. Fetch User Instance (DAO automatically checks both 'admins' & 'users' collections)
    const user = await authDao.findUserByIdentifier(cleanInput, inputId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 3. Blocked / Inactive Account Enforcement
    if (user.status === "Blocked" || user.status === "Inactive") {
      console.warn(`[SECURITY] Blocked user access intercept: ${user.email}`);
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated or blocked. Please contact support.",
      });
    }

    console.log("[DEBUG] Stored Hash DB:", user.password);
    console.log("[DEBUG] Input Password:", password);

    // 4. Password Evaluation Layer
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.warn(`[DEBUG] Credentials mismatch for target node: ${inputId}`);
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log(`[LOGIN SUCCESS] User: ${user.fullName} | Role: ${user.role}`);

    // 5. Generate JWT session tokens and commit response stream
    return await sendTokenResponse(user, res, "Login successful!");
  } catch (error) {
    console.error(
      "[CRITICAL ERROR] Exception caught inside Login loop:",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};


// controllers/auth.controller.js

export const logout = async (req, res) => {
  try {
    // Cookie ko exact same options ke sath clear karein
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // Production me: process.env.NODE_ENV === "production"
      sameSite: "lax",
      path: "/", // Mandatory: Path match hona zaroori hai warna browser cookie delete nahi karega
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed! Internal server error.",
    });
  }
};

