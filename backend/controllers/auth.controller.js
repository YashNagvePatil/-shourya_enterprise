import userModel from "../models/user.models.js";
import { FRANCHISE_TYPES } from "../models/franchise.model.js";
import { config } from "../config/config.js";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../services/storage.service.js";
import franchiseModel from "../models/franchise.model.js";
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
  if (!startAgentId) return null;

  // Queue stores agent identifiers (distributerId or Mongo _id)
  let queue = [startAgentId];
  let visited = new Set();

  while (queue.length > 0) {
    const currentAgentId = queue.shift();
    if (!currentAgentId || visited.has(String(currentAgentId))) continue;
    visited.add(String(currentAgentId));

    // DAO Call: Checks distributerId or _id
    const currentAgent = await authDao.findParentByDistributorId(currentAgentId);
    if (!currentAgent) continue;

    // Safe Child ID Extraction Helper
    const getChildDistId = (child) => {
      if (!child) return null;
      if (typeof child === "string") return child.trim();
      return child.distributerId || child.distributorId || child._id?.toString() || String(child);
    };

    const leftChildId = getChildDistId(currentAgent.leftChild);
    const rightChildId = getChildDistId(currentAgent.rightChild);

    if (targetLeg === "left") {
      // 1. Check if Direct Left is empty
      if (!currentAgent.leftChild) {
        return { parent: currentAgent, position: "left" };
      }
      // 2. Check if Direct Right is empty
      if (!currentAgent.rightChild) {
        return { parent: currentAgent, position: "right" };
      }
      // 3. Both slots full -> Push children to BFS queue for deeper levels
      if (leftChildId) queue.push(leftChildId);
      if (rightChildId) queue.push(rightChildId);
    } 
    else if (targetLeg === "right") {
      // 1. Check if Direct Right is empty
      if (!currentAgent.rightChild) {
        return { parent: currentAgent, position: "right" };
      }
      // 2. Check if Direct Left is empty
      if (!currentAgent.leftChild) {
        return { parent: currentAgent, position: "left" };
      }
      // 3. Both slots full -> Push children to BFS queue for deeper levels
      if (rightChildId) queue.push(rightChildId);
      if (leftChildId) queue.push(leftChildId);
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
   const panUploadResult = await uploadToCloudinary(panCardImage, "kyc_documents");
   const panCardImageUrl = panUploadResult?.url || panUploadResult?.secure_url || "";

// 2. Aadhaar Card Upload
   const adharUploadResult = await uploadToCloudinary(adharCardImage, "kyc_documents");
   const adharCardImageUrl = adharUploadResult?.url || adharUploadResult?.secure_url || "";

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

        // Sponsor Distributor ID safely get karein (handles spelling typos)
          const sponsorDistributorId =
          sponsorUser.distributerId || sponsorUser.distributorId;
        // Check direct slot occupation
      
        const isDirectSlotOccupied = await authDao.checkSlotOccupation(
          sponsorUser._id,
          requestedLeg
        );

        if (!isDirectSlotOccupied) {
          parentUser = sponsorUser;
          finalPlacementPosition = requestedLeg;
          console.log(
            `[PLACEMENT DIRECT] Placed directly under Sponsor ${sponsorDistributorId} on ${finalPlacementPosition}`
          );
        } else {
          console.log(
            `[PLACEMENT SPILLOVER] ${requestedLeg.toUpperCase()} leg occupied under ${sponsorDistributorId}. Searching for deepest vacant slot...`
          );

          // ✅ FIX: Sahi parameter passing with spelling fallbacks
         const vacantSlot = await findDeepestVacantSlot(
            sponsorDistributorId,
            requestedLeg
          );

          if (!vacantSlot || !vacantSlot.parent) {
            console.error(`[PLACEMENT FAILED] No slot found under ${sponsorDistributorId}`);
            return res.status(400).json({
              success: false,
              message: "Unable to find a vacant slot in the selected leg.",
            });
          }

          parentUser = vacantSlot.parent;
          finalPlacementPosition = vacantSlot.position;

          const immediateParentDistId =
            parentUser.distributerId || parentUser.distributerId;

          console.log(
            `[PLACEMENT SPILLOVER SUCCESS] Sponsor: ${sponsorDistributorId} | Auto-placed under Immediate Parent: ${immediateParentDistId} (${finalPlacementPosition})`
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

      sponserId: sponsorUser ? (sponsorUser.distributerId || sponsorUser.distributerId || "DIRECT") : "DIRECT",
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
    console.log("[DEBUG] Unified Login Payload Received:", req.body);

    // Supporting single-field identifiers (email, agentId, phone) or legacy parameters
    const { identifier, distributerId, email, password } = req.body;
    const inputId = (identifier || distributerId || email || "").trim();

    // 1. Input Validation Guard
    if (!inputId || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide Email / Agent ID / Contact Number and Password",
      });
    }

    const cleanInput = inputId.toLowerCase();
    let account = null;

    // 2. Step A: Search in Franchises Collection (Checks by email)
    account = await franchiseModel.findOne({ email: cleanInput });

    // 2. Step B: If not found in Franchises, search in DAO (Users & Admins collections)
    if (!account) {
      account = await authDao.findUserByIdentifier(cleanInput, inputId);
    }

    // 3. User / Account Exist Check
    if (!account) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4. Status Check Guard (Covers Active / Inactive / Blocked for both Models)
    const status = account.status ? account.status.toLowerCase() : "active";
    if (status === "blocked" || status === "inactive" || status === "pending") {
      console.warn(`[SECURITY] Suspended/Inactive access attempt: ${account.email || inputId}`);
      return res.status(403).json({
        success: false,
        message: `Account is currently ${account.status || "Inactive"}. Please contact support or admin.`,
      });
    }

    // 5. Explicit Role Assignment for Franchise (if missing on doc)
    if (account.constructor.modelName === "Franchise" && !account.role) {
      account.role = "FRANCHISE";
    }

    // 6. Password Evaluation Layer
    const isMatch = await account.comparePassword(password);

    if (!isMatch) {
      console.warn(`[DEBUG] Credentials mismatch for: ${inputId}`);
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log(`[LOGIN SUCCESS] Account: ${account.fullName || account.name || account.email} | Role: ${account.role}`);

    // 7. Generate JWT session tokens and return response
    const successMsg = account.role === "FRANCHISE" 
      ? "Franchise logged in successfully" 
      : "Login successful!";

    return await sendTokenResponse(account, res, successMsg, 200);

  } catch (error) {
    console.error("[CRITICAL ERROR] Exception caught inside unified Login controller:", error);
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

