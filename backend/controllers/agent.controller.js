import * as agentDao from "../dao/agent.dao.js";
import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";
import userModel from "../models/user.models.js";
import AgentTransaction from "../models/agentTransaction.model.js";

export const dashBoard = async (req, res) => {
  try {
    // 1. JWT Authentication Se Agent DB ID Extract Karein
    const agentDbId = req.user.id || req.user._id;

    if (!agentDbId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized! User session missing.",
      });
    }

    // 2. Fetch Deep Agent Details from DAO
    const agent = await agentDao.getAgentDataFromDB(agentDbId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent record not found!",
      });
    }

    // 3. Parallel Async Calls (Performance Optimization for DAO)
    const [recentDownlines, leftChildData, rightChildData] = await Promise.all([
      agentDao.getRecentDownlinesFromDB(agent.distributerId),
      agent.leftChild ? agentDao.getAgentDataFromDB(agent.leftChild) : Promise.resolve(null),
      agent.rightChild ? agentDao.getAgentDataFromDB(agent.rightChild) : Promise.resolve(null),
    ]);

    // 4. Dynamic Referral Links Construction
    const baseUrl = process.env.CLIENT_URL || "https://yourdomain.com";
    const leftReferralLink = `${baseUrl}/register?sponsor=${agent.distributerId}&side=left`;
    const rightReferralLink = `${baseUrl}/register?sponsor=${agent.distributerId}&side=right`;

    // 5. Binary BV Analytics Calculations
    const leftBV = Number(agent.leftBV || 0);
    const rightBV = Number(agent.rightBV || 0);
    const matchedBV = Math.min(leftBV, rightBV);
    const carryForwardLeft = leftBV - matchedBV;
    const carryForwardRight = rightBV - matchedBV;

    // 6. Assemble Production-Grade Dashboard Response Object
    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      dashboard: {
        // --- A. Agent Identity & Rank Status ---
        profile: {
          id: agent._id,
          fullName: agent.fullName,
          distributerId: agent.distributerId,
          role: agent.role,
          rank: agent.rank || "Distributor",
          status: agent.status,
          isActivated: agent.isActivated,
          activationDate: agent.activationDate,
          kycStatus: agent.kycStatus || "Not_Submitted",
          email: agent.email,
          contact: agent.contact, // ✅ Fixed: Model key was 'contact' instead of 'phone'
          address: agent.address || {},
          sponsorName: agent.sponserName || "System",
          sponsorId: agent.sponserId || "DIRECT",
          parentName: agent.parrentAgentName || "System",
          createdAt: agent.createdAt,
        },

        // --- B. Referral & Promotion Links ---
        referralLinks: {
          leftLeg: leftReferralLink,
          rightLeg: rightReferralLink,
        },

        // --- C. Financials & Wallet Balance ---
        wallet: {
          walletBalance: Number(agent.walletBalance || 0),
          totalEarning: Number(agent.totalEarning || 0),
          totalMatchingBonus: Number(agent.totalMatchingBonus || 0),
          totalDirectBonus: Number(agent.totalDirectBonus || 0),
          totalWithdrawn: Number(agent.totalWithdrawn || 0),
          pendingPayout: Number(agent.pendingPayout || 0),
        },

        // --- D. Binary Legs & Business Stats ---
        binaryStats: {
          totalDirects: agent.totalDirects || 0,
          bvAnalytics: {
            currentMatchedBV: matchedBV,
            carryForwardLeft,
            carryForwardRight,
          },
          leftLeg: {
            totalAgents: agent.totalLeftAgents || 0,
            activeAgents: agent.activeLeftAgents || 0,
            currentBV: leftBV,
            totalBV: agent.totalLeftBV || 0,
          },
          rightLeg: {
            totalAgents: agent.totalRightAgents || 0,
            activeAgents: agent.activeRightAgents || 0,
            currentBV: rightBV,
            totalBV: agent.totalRightBV || 0,
          },
        },

        // --- E. Immediate Downline Nodes Summary ---
        treeNodes: {
          leftChild: leftChildData
            ? {
                id: leftChildData._id,
                fullName: leftChildData.fullName,
                distributerId: leftChildData.distributerId,
                status: leftChildData.status,
                isActivated: leftChildData.isActivated,
              }
            : null,
          rightChild: rightChildData
            ? {
                id: rightChildData._id,
                fullName: rightChildData.fullName,
                distributerId: rightChildData.distributerId,
                status: rightChildData.status,
                isActivated: rightChildData.isActivated,
              }
            : null,
        },

        // --- F. Recent Downlines Joinings Table ---
        recentDownlines: Array.isArray(recentDownlines) ? recentDownlines : [],
      },
    });
  } catch (error) {
    console.error("[CRITICAL ERROR Dashboard API]:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load agent dashboard details",
      error: error.message,
    });
  }
};

/**
 * Controller to handle binary genealogy network tree retrieval.
 */
export const netWorkTree = async (req, res) => {
  try {
    const agentDbId = req.user?.id;

    if (!agentDbId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access: Agent ID missing",
      });
    }

    // Fetch formatted tree data from DAO layer
    const treeData = await agentDao.getNetworkTreeDao(agentDbId);

    if (!treeData) {
      return res.status(404).json({
        success: false,
        message: "Network tree not found for this agent!",
      });
    }

    // UX Optimization: Set private short-lived cache (60s) to prevent unnecessary re-fetching on rapid UI tab toggles
    res.setHeader("Cache-Control", "private, max-age=60");

    // Clean, Predictable JSON Payload
    return res.status(200).json({
      success: true,
      message: "Genealogy network tree fetched successfully",
      data: treeData,
    });

  } catch (error) {
    console.error("Error in netWorkTree API Controller:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching network tree",
      // Include error detail only in development mode
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// decated wallet 

/**
 * @desc    Get complete agent wallet details with transaction history & withdrawal eligibility
 * @route   GET /api/v1/agent/wallet
 * @access  Private (Agent)
 */
export const getWalletDetails = async (req, res) => {
  try {
    const agentDbId = req.user?.id;

    if (!agentDbId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Agent ID missing.",
      });
    }

    // 1. Fetch Agent wallet & bank details via DAO
    const agent = await agentDao.getAgentWalletDetails(agentDbId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent record not found!",
      });
    }

    // 2. Date Check Logic: Only 5th & 20th of the month allowed
    const today = new Date();
    const currentDayOfMonth = today.getDate();
    const isWithdrawalDayAllowed = currentDayOfMonth === 5 || currentDayOfMonth === 20;

    // 3. Query Recent Agent Transactions
    const recentTransactions = await AgentTransaction.find({ agentId: agentDbId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("transactionId amount transactionType category status title description createdAt")
      .lean();

    // 4. Query Pending Withdrawal Requests (Prevents duplicate requests)
    const pendingWithdrawalCount = await AgentTransaction.countDocuments({
      agentId: agentDbId,
      category: "Withdrawal",
      status: "Pending",
    });

    // 5. Security Layer: Bank Account Masking
    let maskedBankDetails = {
      bankName: agent.bankDetails?.bankName || "N/A",
      ifscCode: agent.bankDetails?.ifscCode || "N/A",
      accountHolderName: agent.bankDetails?.accountHolderName || "N/A",
      accountNumber: "N/A",
      upiId: agent.bankDetails?.upiId
        ? agent.bankDetails.upiId.replace(/^(.{2})(.*)(@.*)$/, "$1****$3")
        : "N/A",
      isBankConfigured: Boolean(agent.bankDetails?.accountNumber && agent.bankDetails?.ifscCode),
    };

    if (agent.bankDetails && agent.bankDetails.accountNumber) {
      const accStr = agent.bankDetails.accountNumber.toString();
      maskedBankDetails.accountNumber = `•••• •••• ${accStr.slice(-4)}`;
    }

    const isKycApproved = agent.kycStatus === "Approved";
    const hasConfiguredBank = maskedBankDetails.isBankConfigured;
    const MIN_WITHDRAWAL_LIMIT = 500;

    // 6. Action Guidance Message for UX & Date Policy
    let actionRequiredMessage = null;
    if (!isKycApproved) {
      actionRequiredMessage = "Please complete your KYC verification to enable withdrawals.";
    } else if (!hasConfiguredBank) {
      actionRequiredMessage = "Please add your bank account details in Profile to receive payouts.";
    } else if (pendingWithdrawalCount > 0) {
      actionRequiredMessage = "You already have a pending withdrawal request in process.";
    } else if (!isWithdrawalDayAllowed) {
      actionRequiredMessage = "Withdrawals are only allowed on the 5th and 20th of every month.";
    }

    // 7. Final Response JSON
    return res.status(200).json({
      success: true,
      message: "Wallet details and transaction history fetched successfully.",
      data: {
        balances: {
          availableBalance: agent.walletBalance || 0,
          totalEarnings: agent.totalEarning || 0,
          totalWithdrawn: agent.totalWithdrawn || 0,
          pendingPayout: agent.pendingPayout || 0,
        },

        earningsBreakdown: {
          binaryMatchingBonus: agent.totalMatchingBonus || 0,
          directReferralBonus: agent.totalDirectBonus || 0,
        },

        // Withdrawal Rules & Eligibility Status
        payoutEligibility: {
          isKycApproved,
          hasConfiguredBank,
          hasPendingWithdrawal: pendingWithdrawalCount > 0,
          isWithdrawalDayAllowed, // Returns true ONLY on 5th or 20th
          canWithdraw:
            isKycApproved &&
            hasConfiguredBank &&
            pendingWithdrawalCount === 0 &&
            isWithdrawalDayAllowed &&
            (agent.walletBalance || 0) >= MIN_WITHDRAWAL_LIMIT,
          allowedWithdrawalDays: [5, 20],
          minWithdrawalAmount: MIN_WITHDRAWAL_LIMIT,
          actionRequiredMessage,
        },

        payoutDestination: {
          kycStatus: agent.kycStatus || "Pending",
          bankDetails: maskedBankDetails,
        },

        recentTransactions: recentTransactions || [],
      },
    });
  } catch (error) {
    console.error("Error in getWalletDetails API:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching wallet data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// Get Authenticated Agent's Cart
export const getCart = async (req, res) => {
  try {
    let cart = await cartModel.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) {
      cart = await cartModel.create({ user: req.user._id, items: [] });
    }
    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add / Update Product in Cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id; // Logged-in Agent ID from Auth Middleware

    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await cartModel.findOne({ user: userId });
    if (!cart) {
      cart = new cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        pv: product.pv || 0,
      });
    }

    cart.calculateTotals();
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove Item from Cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await cartModel.findOne({ user: req.user._id });

    if (cart) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
      cart.calculateTotals();
      await cart.save();
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



/**
 * @desc    Get complete Agent Profile details
 * @route   GET /api/v1/agent/profile
 * @access  Private (Agent/Admin)
 */
export const getAgentProfile = async (req, res) => {
  try {
    const agentId = req.user?.id;

    if (!agentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Agent ID missing.",
      });
    }

    // Fetch user profile without sensitive fields like password
    const agent = await userModel.findById(agentId).select("-password").lean();

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Agent profile retrieved successfully.",
      data: agent,
    });
  } catch (error) {
    console.error("Error fetching agent profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while retrieving agent profile.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Update basic personal info & shipping address
 * @route   PUT /api/v1/agent/profile/update
 * @access  Private (Agent)
 */
export const updateAgentProfile = async (req, res) => {
  try {
    const agentId = req.user?.id;
    const { fullName, contact, address } = req.body;

    const agent = await userModel.findById(agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent record not found.",
      });
    }

    // Update basic info if provided
    if (fullName) agent.fullName = fullName.trim();
    if (contact) agent.contact = contact;

    // Update shipping address fields
    if (address) {
      agent.address = {
        street: address.street !== undefined ? address.street : agent.address.street,
        city: address.city !== undefined ? address.city : agent.address.city,
        state: address.state !== undefined ? address.state : agent.address.state,
        pincode: address.pincode !== undefined ? address.pincode : agent.address.pincode,
      };
    }

    await agent.save();

    // Remove password before response
    const updatedAgent = agent.toObject();
    delete updatedAgent.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedAgent,
    });
  } catch (error) {
    console.error("Error updating agent profile:", error);

    // Duplicate contact handling
    if (error.code === 11000 && error.keyPattern?.contact) {
      return res.status(400).json({
        success: false,
        message: "Contact number is already in use by another account.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while updating profile.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Submit/Update KYC documents (Cloudinary URLs)
 * @route   POST /api/v1/agent/profile/kyc
 * @access  Private (Agent)
 */
export const submitAgentKYC = async (req, res) => {
  try {
    const agentId = req.user?.id;
    const { panCardImage, adharCardImage } = req.body;

    if (!panCardImage && !adharCardImage) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one valid KYC document URL (PAN/Aadhaar).",
      });
    }

    const agent = await userModel.findById(agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found.",
      });
    }

    // Prevent re-submitting if KYC is already approved
    if (agent.kycStatus === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Your KYC has already been verified and approved. Contact admin for modifications.",
      });
    }

    if (panCardImage) agent.panCardImage = panCardImage;
    if (adharCardImage) agent.adharCardImage = adharCardImage;

    // Change KYC status to Pending for Admin Verification
    agent.kycStatus = "Pending";

    await agent.save();

    return res.status(200).json({
      success: true,
      message: "KYC documents submitted successfully. Verification pending.",
      data: {
        kycStatus: agent.kycStatus,
        panCardImage: agent.panCardImage,
        adharCardImage: agent.adharCardImage,
      },
    });
  } catch (error) {
    console.error("Error submitting KYC:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while submitting KYC.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Update Bank Details for Payouts & Withdrawals
 * @route   PUT /api/v1/agent/profile/bank-details
 * @access  Private (Agent)
 */
export const updateBankDetails = async (req, res) => {
  try {
    const agentId = req.user?.id;
    const { accountNumber, ifscCode, bankName, accountHolderName, upiId } = req.body;

    const agent = await userModel.findById(agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found.",
      });
    }

    // Assign Bank Details
    agent.bankDetails = {
      accountNumber: accountNumber !== undefined ? accountNumber : agent.bankDetails.accountNumber,
      ifscCode: ifscCode !== undefined ? ifscCode.toUpperCase().trim() : agent.bankDetails.ifscCode,
      bankName: bankName !== undefined ? bankName.trim() : agent.bankDetails.bankName,
      accountHolderName: accountHolderName !== undefined ? accountHolderName.trim() : agent.bankDetails.accountHolderName,
      upiId: upiId !== undefined ? upiId.trim() : agent.bankDetails.upiId,
    };

    await agent.save();

    return res.status(200).json({
      success: true,
      message: "Bank details updated successfully.",
      data: agent.bankDetails,
    });
  } catch (error) {
    console.error("Error updating bank details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating bank details.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};