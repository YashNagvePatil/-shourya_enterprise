import * as adminDao from "../dao/admin.dao.js";

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
    const result = await agentDao.getPaginatedAgents({
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

