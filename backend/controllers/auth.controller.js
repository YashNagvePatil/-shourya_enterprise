import userModel from "../models/user.models.js";
import { config } from "../config/config.js";
import jwt from "jsonwebtoken";
import * as authDao from "../dao/auth.dao.js"

async function sendTokenResponse(user, res, message) {
  const token = jwt.sign({ id: user._id, role: user.role }, config.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Set HTTP-Only Cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return res.status(201).json({
    message,
    success: true,
    user: {
      id: user._id,
      email: user.email,
      contact: user.contact,
      fullName: user.fullName,
      role: user.role,
      distributerId: user.distributerId, // New agent id
      parentAgentName: user.parrentAgentName,
      parentAgentId: user.parentAgentId,
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

export const register = async (req, res) => {
  const {
    email,
    contact,
    password,
    fullName,
    role,
    panCardNumber,
    adharCardNumber,
    parentAgentId,
    parrentAgentName,
    position,
  } = req.body;

  console.log(`[DEBUG] Registration Attempt for: ${email} | Role: ${role}`);

  try {
    // SAFETY NET 1: Required Fields Validation Block
    if (!email || !contact || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all mandatory fields (Name, Email, Contact, Password)",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // SAFETY NET 2: Structural Duplicate Matrix Exception Check via DAO
    const existingUser = await authDao.findExistingUserByEmailOrContact(
      cleanEmail,
      contact,
    );

    if (existingUser) {
      console.warn(
        `[DEBUG] Duplicate User Blocked: ${cleanEmail} / ${contact}`,
      );
      return res.status(400).json({
        success: false,
        message: "Email or Contact number already registered!",
      });
    }

    let parentUser = null;
    let finalPosition = null;
    const isTargetAgent = role !== "Admin";

    if (isTargetAgent) {
      const totalAgentCount = await authDao.getAgentCount();

      if (totalAgentCount === 0) {
        // CASE A: Processing setup parameters for Root Element Node
        console.log("[DEBUG] No agents in DB. Creating First Root Agent...");
        parentUser = null;
        finalPosition = null;
      } else {
        // CASE B: Processing validations for Normal Tree Nodes
        finalPosition = position === "left" ? "left" : "right";

        if (!parentAgentId) {
          return res.status(400).json({
            success: false,
            message: "Parent Agent ID is required for registration!",
          });
        }

        // Verify parent node validity via DAO
        parentUser = await authDao.findParentByDistributorId(parentAgentId);

        if (!parentUser) {
          console.warn(`[DEBUG] Invalid Parent Agent ID: ${parentAgentId}`);
          return res.status(404).json({
            success: false,
            message: "Invalid Agent ID! Parent Agent does not exist.",
          });
        }

        // SAFETY NET 3: Slot Collision Verification Engine via DAO
        const targetPosition = position === "left" ? "left" : "right";
        const isSlotOccupied = await authDao.checkSlotOccupation(
          parentUser._id,
          targetPosition,
        );

        if (isSlotOccupied) {
          console.warn(
            `[DEBUG] Slot Conflict: ${parentAgentId} -> ${targetPosition} is already taken!`,
          );
          return res.status(400).json({
            success: false,
            message: `The ${targetPosition.toUpperCase()} slot under ${parentAgentId} is already occupied!`,
          });
        }
      }
    }

    // SAFETY NET 4: Generate Guaranteed Unique Agent ID Layout Index
    const newDistributedId = await genrateUniqueDistributerId();
    console.log(`[DEBUG] New Agent ID Generated: ${newDistributedId}`);

    // Build the structural entity payload schema cleanly
    const agentPayload = {
      email: cleanEmail,
      contact,
      password,
      fullName: fullName.trim(),
      adharCardNumber,
      panCardNumber,
      distributerId: newDistributedId,
      role: role === "Admin" ? "Admin" : "Agent",
      position: role === "Admin" ? null : finalPosition,
      parentAgentId: parentUser ? parentUser._id : null,
      sponserId: parentUser ? parentUser.distributerId : "DIRECT",
      sponserName: parentUser ? parentUser.fullName : "system",
      parrentAgentName: parentUser
        ? parentUser.fullName
        : parrentAgentName || "system",
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

    // Save entity state using the data access layer
    const user = await authDao.createAgentRecord(agentPayload);
    console.log(
      `[DEBUG] Registration Successful! Created User ID: ${user._id}`,
    );
    if (role !== "Admin" && parentUser) {
      console.log(
        `[TREE UPDATE] Processing network updates under parent ID: ${parentUser.distributerId}`,
      );

      // 1. Parent ka child node pointer link karein
      await authDao.updateParentChildSlot(
        parentUser._id,
        finalPosition,
        user._id,
      );

      // 2. Sponsor ka counter increment karein (SponserId check ke sath)
      if (user.sponserId && user.sponserId !== "DIRECT") {
        await authDao.incrementSponsorDirectCount(user.sponserId);
      }

      // 3. Poore upline chain ke loops ko update karein
      const initialJoiningBV = 0; // Agar package activation par BV milna hai toh yahan pass karein
      await authDao.updateAllUplinesCounters(
        parentUser._id,
        finalPosition,
        initialJoiningBV,
      );

      console.log(`[TREE UPDATE] All uplines sync completely.`);
    }

    // Generate session payload response
    return await sendTokenResponse(user, res, "Registration Successful!");
  } catch (error) {
    console.error(
      `[CRITICAL ERROR] Registration Loop Failed: ${error.message}`,
    );
    return res.status(500).json({
      success: false,
      message: "Server Error during registration",
      error: error.message,
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


