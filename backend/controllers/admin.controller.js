import userModel from "../models/user.model.js";

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