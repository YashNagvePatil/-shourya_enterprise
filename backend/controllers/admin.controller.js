import * as adminDao from "../dao/admin.dao.js";
import userModel from "../models/user.models.js";
import inventryModel from "../models/inventry.model.js";
import productModel from "../models/product.model.js";

/**
 * @desc    Get complete Agent Analytics & Metrics for Admin Dashboard
 * @route   GET /api/admin/dashboard/agents
 * @access  Private (Admin Only)
 */
export const getAdminDashboardData = async (req, res) => {
  try {
    console.log(`[ADMIN DASHBOARD] Fetching agent analytics by Admin: ${req.user._id}`);

    // Call DAO layer function
    const dashboardData = await adminDao.fetchAdminDashboardMetrics();

    return res.status(200).json({
      success: true,
      message: "Admin dashboard data retrieved successfully",
      data: {
        summary: {
          totalAgents: dashboardData.overview.totalAgents,
          activeAgents: dashboardData.overview.activeAgents,
          blockedAgents: dashboardData.overview.blockedAgents,
          inactiveAgents: dashboardData.overview.inactiveAgents,
        },
        recentAgents: dashboardData.recentAgents,
        monthlyTrend: dashboardData.onboardingTrend,
      },
    });
  } catch (error) {
    console.error("[CRITICAL ERROR] Failed to fetch Admin Dashboard Data:", error);
    return res.status(500).json({
      success: true,
      message: "Server error while fetching dashboard analytics",
      error: error.message,
    });
  }
};

export const getAgentsList = async (req, res) => {
  try {
    const { 
      search = "", 
      status, 
      role, 
      page = 1, 
      limit = 10, 
      sortBy = "createdAt", 
      sortOrder = "desc" 
    } = req.query;

    // Call DAO method
    const result = await adminDao.getPaginatedAgents({
      search: search.trim(),
      status,
      role,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sortBy,
      sortOrder
    });

    return res.status(200).json({
      success: true,
      message: "Agents list fetched successfully",
      data: result.agents,
      pagination: result.pagination
    });

  } catch (error) {
    console.error("Error in getAgentsList Controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching agents list",
      error: error.message
    });
  }
};

//  Get Complete Agent Deep Details
export const getAgentById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Agent basic detail fetch karein
    const agent = await userModel.findById(id).lean();
    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    // 2. Recent Activity / Work: Downline me jude naye members (Referrals)
    const recentMembers = await userModel
      .find({ parentAgentId: id })
      .select("fullName distributerId packageAmount isActivated createdAt status")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Work / Activity Data Format 
    const recentWorkFormatted = recentMembers.map((member) => ({
      _id: member._id,
      amount: member.packageAmount || 0,
      status: member.isActivated ? "Activated" : member.status,
      title: `Joined: ${member.fullName} (${member.distributerId})`,
      createdAt: member.createdAt,
    }));

    // 3. Response Construct
    res.status(200).json({
      success: true,
      data: {
        ...agent,

        // KYC Documents (PAN & Aadhaar Image Links/Base64)
        panCardImage: agent.panCardImage || null,
        adharCardImage: agent.adharCardImage || null,

        // Frontend keys ke liye fallback mappings
        phone: agent.contact || null,

        // Bank details structure mapping
        bankDetails: {
          accountHolder: agent.bankDetails?.accountHolderName || "N/A",
          accountNumber: agent.bankDetails?.accountNumber || "N/A",
          bankName: agent.bankDetails?.bankName || "N/A",
          ifscCode: agent.bankDetails?.ifscCode || "N/A",
          upiId: agent.bankDetails?.upiId || "N/A",
        },

        // Network Stats
        network: {
          leftCount: agent.totalLeftAgents || 0,
          rightCount: agent.totalRightAgents || 0,
          totalSubAgents: (agent.totalLeftAgents || 0) + (agent.totalRightAgents || 0),
        },

        // Revenue Stats
        revenue: {
          totalEarnings: agent.totalEarning || 0,
          pendingPayout: agent.pendingPayout || 0,
        },

        // Recent Work (Downline Activity)
        recentWork: recentWorkFormatted,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


//  Block / Unblock Agent/Active
export const toggleAgentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body; // status: "Blocked" | "Active"

    // 1. Basic Status Validation
    if (!status || !["Active", "Blocked"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status provided. It must be either 'Active' or 'Blocked'.",
      });
    }

    // 2. Build Update Fields Dynamically
    const updateFields = { status };

    if (status === "Blocked") {
      // Agar block kar rahe hain toh reason save karo
      updateFields.blockReason = reason || "No reason provided";
    } else if (status === "Active") {
      // Agar unblock/active kar rahe hain toh puraani reason clear kar do
      updateFields.blockReason = "";
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

    // 4. Dynamic Response Message
    const isBlocked = status === "Blocked";
    const message = isBlocked
      ? "Agent has been blocked successfully."
      : "Agent has been unblocked and activated successfully.";

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

