import mongoose from "mongoose";
import * as adminDao from "../dao/admin.dao.js";
import userModel from "../models/user.models.js";
import inventryModel from "../models/inventry.model.js";
import productModel from "../models/product.model.js";

/**
 * @desc    Get complete Agent Analytics & Metrics for Admin Dashboard
 * @route   GET /api/admin/dashboard/agents
 * @access  Private (Admin Only)
 */
export const getAdminAgentAnalytics = async (req, res) => {
  try {
    const adminId = req.user?._id;
    console.log(`[ADMIN DASHBOARD] Deep agent tracking analytics accessed by Admin/Owner: ${adminId}`);

    // Parsing query parameters for pagination, filters, and search
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { search, status, rank, sortBy } = req.query;

    // Fetch deep metrics from DAO layer
    const agentAnalytics = await adminDao.fetchDeepAgentAnalytics({
      page,
      limit,
      search,
      status,
      rank,
      sortBy,
    });

    const overview = agentAnalytics?.networkOverview || {};
    const binaryStats = agentAnalytics?.globalBinaryMetrics || {};

    return res.status(200).json({
      success: true,
      message: "Detailed agent tracking analytics retrieved successfully",
      data: {
        // High-Level System Performance (Owner Snapshot)
        networkOverview: {
          totalAgents: overview.totalAgents || 0,
          activeAgents: overview.activeAgents || 0,
          blockedAgents: overview.blockedAgents || 0,
          pendingKYCAgents: overview.pendingKYC || 0,
          newJoiningsToday: overview.todayJoinings || 0,
        },

        // Global System Volume & Binary Matching Insights
        globalBinaryOverview: {
          totalLeftPV: binaryStats.totalLeftPV || 0,
          totalRightPV: binaryStats.totalRightPV || 0,
          totalMatchedPV: binaryStats.totalMatchedPV || 0,
          unmatchedCarryForwardPV: binaryStats.totalCarryForward || 0,
          pendingPayoutsTotal: binaryStats.pendingPayoutAmount || 0,
        },

        // Deep Individual Agent Performance List
        agents: (agentAnalytics?.agentsList || []).map((agent) => ({
          agentId: agent._id,
          agentCode: agent.agentCode || agent.username,
          fullName: agent.fullName || agent.name,
          email: agent.email,
          mobile: agent.mobile,
          status: agent.status, // Active, Inactive, Blocked
          kycVerified: agent.kycStatus === "APPROVED",
          joinedAt: agent.createdAt,

          // Genealogy & Placement Context
          sponsorCode: agent.sponsorCode || "Direct System",
          parentPlacementCode: agent.parentCode || "N/A",
          treePosition: agent.position, // "Left" or "Right"
          treeDepthLevel: agent.treeLevel || 1,

          // Dynamic Binary Leg Tracking
          binaryPerformance: {
            leftLegPV: agent.binaryData?.leftLegPV || 0,
            rightLegPV: agent.binaryData?.rightLegPV || 0,
            leftCarryForward: agent.binaryData?.leftCarryForward || 0,
            rightCarryForward: agent.binaryData?.rightCarryForward || 0,
            leftActiveMembers: agent.binaryData?.leftActiveCount || 0,
            rightActiveMembers: agent.binaryData?.rightActiveCount || 0,
          },

          // Financial & Earning Breakdown
          financials: {
            rank: agent.rank || "Distributor",
            totalEarnings: agent.wallet?.totalEarned || 0,
            matchingBonusEarned: agent.wallet?.matchingBonus || 0,
            directReferralBonus: agent.wallet?.directBonus || 0,
            currentBalance: agent.wallet?.balance || 0,
          },
        })),

        // Pagination Meta Data
        pagination: {
          currentPage: page,
          totalPages: agentAnalytics?.totalPages || 1,
          totalRecords: agentAnalytics?.totalCount || 0,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("[CRITICAL ERROR] Failed to fetch Admin Deep Agent Analytics:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching detailed agent analytics",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal Server Error",
    });
  }
};

export const getAgentsList = async (req, res) => {
  try {
    const {
      search = "",
      status,
      role,
      rank,
      kycStatus,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      exportData = false, // Dynamic Export mode switch
    } = req.query;

    // Sanitize and parse query parameters
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10)); // Cap max limit to 100

    // DAO Execution
    const result = await adminDao.getPaginatedAgents({
      search: search.trim(),
      status,
      role,
      rank,
      kycStatus,
      startDate,
      endDate,
      page: parsedPage,
      limit: parsedLimit,
      sortBy,
      sortOrder,
      exportData: exportData === "true",
    });

    return res.status(200).json({
      success: true,
      message: "Agents list fetched successfully",
      data: {
        agents: result.agents,
        // UI filters drop-downs ko dynamic populating help ke liye active summary metrics
        metricsSummary: result.summary || {
          total: result.pagination.totalCount,
          activeCount: 0,
          pendingKycCount: 0,
        },
      },
      pagination: result.pagination,
      appliedFilters: {
        search: search.trim() || null,
        status: status || "All",
        role: role || "All",
        rank: rank || "All",
        kycStatus: kycStatus || "All",
        dateRange: startDate && endDate ? { startDate, endDate } : null,
      },
    });
  } catch (error) {
    console.error("Error in getAgentsList Controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching agents list",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal Server Error",
    });
  }
};

//  Get Complete Agent Deep Details
export const getAgentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Agent Identifier format",
      });
    }

    // 1. Fetch Agent (Excluding sensitive internal auth fields)
    const agent = await userModel
      .findById(id)
      .select("-password -passwordResetToken -__v")
      .lean();

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent record not found",
      });
    }

    // 2. Fetch Direct Sponsor Details (Sponsor / Upline context)
    let sponsorInfo = null;
    if (agent.sponsorId || agent.parentAgentId) {
      sponsorInfo = await userModel
        .findById(agent.sponsorId || agent.parentAgentId)
        .select("fullName agentCode email mobile rank")
        .lean();
    }

    // 3. Downline Recent Activity (Last 5 Direct Onboardings)
    const recentMembers = await userModel
      .find({ $or: [{ parentAgentId: id }, { sponsorId: id }] })
      .select("fullName agentCode distributerId packageAmount isActivated createdAt status position rank")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Format activity timeline logs
    const recentWorkFormatted = recentMembers.map((member) => ({
      _id: member._id,
      agentCode: member.agentCode || member.distributerId || "N/A",
      fullName: member.fullName,
      amount: member.packageAmount || 0,
      status: member.isActivated ? "Activated" : member.status || "Pending",
      position: member.position || "N/A",
      rank: member.rank || "Distributor",
      title: `Direct Referral: ${member.fullName} (${member.agentCode || member.distributerId || "N/A"})`,
      joinedAt: member.createdAt,
    }));

    // 4. Detailed Response Assembly
    return res.status(200).json({
      success: true,
      message: "Agent detailed profile retrieved successfully",
      data: {
        // Basic Identity
        _id: agent._id,
        agentCode: agent.agentCode || agent.username || agent.distributerId,
        fullName: agent.fullName,
        email: agent.email,
        phone: agent.contact || agent.mobile || null,
        status: agent.status || "Inactive",
        role: agent.role || "Agent",
        rank: agent.rank || "Distributor",
        joinedAt: agent.createdAt,

        // Sponsor Context
        uplineInfo: {
          sponsorId: sponsorInfo?._id || null,
          sponsorCode: sponsorInfo?.agentCode || agent.sponsorCode || "Direct System",
          sponsorName: sponsorInfo?.fullName || "System Admin",
          sponsorPhone: sponsorInfo?.mobile || null,
        },

        // KYC & Identification Status
        kycDetails: {
          kycStatus: agent.kycStatus || (agent.isKycApproved ? "APPROVED" : "PENDING"),
          submittedAt: agent.kycSubmittedAt || null,
          rejectionReason: agent.kycRejectionReason || null,
          panCardNumber: agent.panCardNumber || "N/A",
          panCardImage: agent.panCardImage || null,
          adharCardImage: agent.adharCardImage || null,
        },

        // Financial & Payout Summary
        financials: {
          totalEarnings: agent.totalEarning || agent.wallet?.totalEarned || 0,
          pendingPayout: agent.pendingPayout || agent.wallet?.pendingPayout || 0,
          currentWalletBalance: agent.wallet?.balance || 0,
          matchingBonusEarned: agent.wallet?.matchingBonus || 0,
          directReferralBonus: agent.wallet?.directBonus || 0,
          totalWithdrawn: agent.wallet?.totalWithdrawn || 0,
        },

        // Banking & Verification Metadata
        bankDetails: {
          accountHolder: agent.bankDetails?.accountHolderName || agent.fullName || "N/A",
          accountNumber: agent.bankDetails?.accountNumber || "N/A",
          bankName: agent.bankDetails?.bankName || "N/A",
          ifscCode: agent.bankDetails?.ifscCode || "N/A",
          upiId: agent.bankDetails?.upiId || "N/A",
        },

        // Binary Network Metrics
        network: {
          leftCount: agent.totalLeftAgents || agent.binaryData?.leftActiveCount || 0,
          rightCount: agent.totalRightAgents || agent.binaryData?.rightActiveCount || 0,
          totalSubAgents:
            (agent.totalLeftAgents || agent.binaryData?.leftActiveCount || 0) +
            (agent.totalRightAgents || agent.binaryData?.rightActiveCount || 0),
          leftLegPV: agent.binaryData?.leftLegPV || 0,
          rightLegPV: agent.binaryData?.rightLegPV || 0,
          leftCarryForwardPV: agent.binaryData?.leftCarryForward || 0,
          rightCarryForwardPV: agent.binaryData?.rightCarryForward || 0,
        },

        // Recent Downline Onboardings
        recentWork: recentWorkFormatted,
      },
    });
  } catch (error) {
    console.error("Error in getAgentById Controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching agent details",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal Server Error",
    });
  }
};


//  Block / Unblock Agent/Active
export const toggleAgentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, kycStatus } = req.body; 

    // 1. Validation for provided fields
    const validStatuses = ["Active", "Blocked"];
    const validKycStatuses = ["Not_Submitted", "Pending", "Approved", "Rejected"];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status provided. Must be either 'Active' or 'Blocked'.",
      });
    }

    if (kycStatus && !validKycStatuses.includes(kycStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid kycStatus provided. Must be one of: 'Not_Submitted', 'Pending', 'Approved', 'Rejected'.",
      });
    }

    if (!status && !kycStatus) {
      return res.status(400).json({
        success: false,
        message: "Please provide either status or kycStatus to update.",
      });
    }

    // 2. Build Update Fields Dynamically
    const updateFields = {};

    if (status) {
      updateFields.status = status;
      if (status === "Blocked") {
        updateFields.blockReason = reason || "No reason provided";
      } else if (status === "Active") {
        updateFields.blockReason = "";
      }
    }

    if (kycStatus) {
      updateFields.kycStatus = kycStatus;
    }

    // 3. Update Database Record
    const updatedAgent = await userModel.findByIdAndUpdate(
      id,
      updateFields,
      { returnDocument: "after" }
    );

    if (!updatedAgent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found.",
      });
    }

    // 4. Construct Dynamic Response Message
    let message = "Agent updated successfully.";
    if (status && kycStatus) {
      message = `Agent status updated to '${status}' and KYC status updated to '${kycStatus}'.`;
    } else if (status) {
      message = status === "Blocked"
        ? "Agent has been blocked successfully."
        : "Agent has been unblocked and activated successfully.";
    } else if (kycStatus) {
      message = `Agent KYC status has been updated to '${kycStatus}'.`;
    }

    return res.status(200).json({
      success: true,
      message,
      data: updatedAgent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const purchaseItem = async (req, res) => {
  try {
    const { itemId, quantity, purchasePrice } = req.body;

    if (!itemId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid item ID and positive quantity are required",
      });
    }

    // Find or create Inventory entry
    let inventoryItem = await inventryModel.findOne({
      $or: [{ _id: itemId }, { product: itemId }],
    });

    if (!inventoryItem) {
      const product = await productModel.findById(itemId);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      inventoryItem = new inventryModel({
        product: product._id,
        sku: product.sku,
        quantity: product.stock || 0,
        costPrice: purchasePrice || product.price,
      });
    }

    // Update stock quantity
    inventoryItem.quantity += Number(quantity);
    if (purchasePrice) inventoryItem.costPrice = Number(purchasePrice);

    await inventoryItem.save();

    // Also update Product.stock in Product collection for consistency
    await productModel.findByIdAndUpdate(inventoryItem.product, {
      $inc: { stock: Number(quantity) },
    });

    await inventoryItem.populate("product");

    return res.status(200).json({
      success: true,
      message: `Successfully added ${quantity} units to stock`,
      data: inventoryItem,
    });
  } catch (error) {
    console.error("Error in purchaseItem:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const deductItemStock = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    // 1. Validation
    if (!itemId || !quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid item ID and positive quantity are required",
      });
    }

    const deductQty = Number(quantity);

    // 2. Search existing inventory record
    let inventoryItem = await inventryModel.findOne({
      $or: [{ _id: itemId }, { product: itemId }],
    });

    // 3. Fallback to Product Collection if no inventory entry exists yet
    if (!inventoryItem) {
      const product = await productModel.findById(itemId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found in system",
        });
      }

      // Initialize inventory document with current product details
      inventoryItem = new inventryModel({
        product: product._id,
        sku: product.sku || `SKU-${Date.now()}`,
        quantity: product.stock || 0, // 👈 Product schema se baseline stock pick karega (e.g. 175)
        costPrice: product.price || 0,
      });
    }

    // 4. Stock sufficiency check
    if (inventoryItem.quantity < deductQty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock! Available stock: ${inventoryItem.quantity}`,
      });
    }

    // 5. Deduct from Inventory collection
    inventoryItem.quantity -= deductQty;
    await inventoryItem.save();

    // 6. Dual-Sync: Update stock in Product collection as well
    await productModel.findByIdAndUpdate(inventoryItem.product, {
      $inc: { stock: -deductQty },
    });

    await inventoryItem.populate("product");

    return res.status(200).json({
      success: true,
      message: `Successfully deducted ${deductQty} units from stock`,
      data: inventoryItem,
    });
  } catch (error) {
    console.error("Error in deductItemStock:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getInventoryItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    // 1. Try finding in Inventory Collection
    let inventoryItem = await inventryModel
      .findOne({
        $or: [{ _id: itemId }, { product: itemId }],
      })
      .populate("product");

    // 2. If no record in Inventory Collection, check Product Collection
    if (!inventoryItem) {
      const product = await productModel.findById(itemId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found in system",
        });
      }

      // Auto-Sync: Create Inventory entry using existing Product details
      inventoryItem = await inventryModel.create({
        product: product._id,
        sku: product.sku || `SKU-${Date.now()}`,
        quantity: product.stock || 0, // 👈 Takes 175 from Product Schema
        costPrice: product.price || 0,
      });

      inventoryItem = await inventoryItem.populate("product");
    }

    return res.status(200).json({
      success: true,
      data: inventoryItem,
    });
  } catch (error) {
    console.error("Error in getInventoryItem:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


