import userModel from "../models/user.models.js"

export const fetchAdminDashboardMetrics = async () => {
  const [agentCounts, recentAgents, agentStatusBreakdown] = await Promise.all([
    // 1. Total count, Active, and Blocked agents count
    userModel.aggregate([
      {
        $group: {
          _id: null,
          totalAgents: { $sum: 1 },
          activeAgents: {
            $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
          },
          blockedAgents: {
            $sum: { $cond: [{ $eq: ["$status", "Blocked"] }, 1, 0] },
          },
          inactiveAgents: {
            $sum: { $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0] },
          },
        },
      },
    ]),

    // 2. Fetch last 5 recently registered agents (Excluding sensitive data like password)
    userModel
      .find({}, { password: 0, __v: 0 })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    // 3. Monthly Agent Onboarding Trend (Graph/Chart data for UI)
    userModel.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]),
  ]);

  // Handle empty collection fallback values
  const metrics = agentCounts[0] || {
    totalAgents: 0,
    activeAgents: 0,
    blockedAgents: 0,
    inactiveAgents: 0,
  };

  return {
    overview: metrics,
    recentAgents,
    onboardingTrend: agentStatusBreakdown,
  };
};


export const getPaginatedAgents = async ({ search, status, role, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" }) => {
    // 1. Build dynamic query filter
    const query = {};

    // Search by Name or Email (Case-insensitive)
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by Status (Active, Inactive, Blocked)
    if (status) {
      query.status = status;
    }

    // Filter by Role
    if (role) {
      query.role = role;
    }

    // 2. Pagination calculation
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // 3. Execute DB queries concurrently for performance
    const [agents, totalCount] = await Promise.all([
      userModel.find(query)
        .select("-password -__v") // Exclude sensitive details
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(), // Convert to plain JS objects for fast execution

      userModel.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      agents,
      pagination: {
        totalCount,
        totalPages,
        currentPage: Number(page),
        limit: Number(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }
