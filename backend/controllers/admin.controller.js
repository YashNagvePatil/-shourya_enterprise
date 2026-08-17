import * as adminDao from "../dao/admin.dao.js";
import userModel from "../models/user.models.js";

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
    // Parent Agent ID ke through direct joinings ko "Recent Work" maante hain
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
//  Block / Unblock Agent
export const toggleAgentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body; // status: "Blocked" | "Active"

    const updatedAgent = await userModel.findByIdAndUpdate(
      id,
      { status, blockReason: reason || "" },
      { returnDocument:"after" }
    );

    res.status(200).json({
      success: true,
      message: `Agent status updated to ${status}`,
      data: updatedAgent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

