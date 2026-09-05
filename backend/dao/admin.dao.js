import userModel from "../models/user.models.js";

// Existing code (fetchAdminDashboardMetrics & getPaginatedAgents)...

/**
 * Deep Agent Analytics DAO (Binary Tracking, Financials, Dynamic Search & Aggregation)
 */
export const fetchDeepAgentAnalytics = async ({
  page = 1,
  limit = 10,
  search,
  status,
  rank,
  sortBy = "createdAt",
}) => {
  const skip = (page - 1) * limit;

  // 1. Dynamic Match Query Build Karein
  const matchQuery = {};

  if (search) {
    matchQuery.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { agentCode: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    matchQuery.status = status;
  }

  if (rank) {
    matchQuery.rank = rank;
  }

  // Today's Start Date (Midnight)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 2. Parallel Database Operations
  const [networkOverviewRaw, globalBinaryMetricsRaw, agentsList, totalCount, monthlyTrendRaw] =
    await Promise.all([
      // A. Network High-Level Overview Metrics
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
            pendingKYC: {
              $sum: { $cond: [{ $eq: ["$kycStatus", "PENDING"] }, 1, 0] },
            },
            todayJoinings: {
              $sum: { $cond: [{ $gte: ["$createdAt", todayStart] }, 1, 0] },
            },
          },
        },
      ]),

      // B. System-Wide Binary Leg Metrics
      userModel.aggregate([
        {
          $group: {
            _id: null,
            totalLeftPV: { $sum: "$binaryData.leftLegPV" },
            totalRightPV: { $sum: "$binaryData.rightLegPV" },
            totalMatchedPV: { $sum: "$binaryData.matchedPV" },
            totalCarryForward: {
              $sum: {
                $add: [
                  { $ifNull: ["$binaryData.leftCarryForward", 0] },
                  { $ifNull: ["$binaryData.rightCarryForward", 0] },
                ],
              },
            },
            pendingPayoutAmount: { $sum: "$wallet.pendingPayout" },
          },
        },
      ]),

      // C. Deep Paginated Agents List with Safe Fields Selection
      userModel
        .find(matchQuery)
        .select("-password -__v")
        .sort({ [sortBy]: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      // D. Total Filtered Documents Count
      userModel.countDocuments(matchQuery),

      // E. Monthly Registration Growth Trend
      userModel.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]),
    ]);

  // Fallbacks for Empty Collections
  const networkOverview = networkOverviewRaw[0] || {
    totalAgents: 0,
    activeAgents: 0,
    blockedAgents: 0,
    pendingKYC: 0,
    todayJoinings: 0,
  };

  const globalBinaryMetrics = globalBinaryMetricsRaw[0] || {
    totalLeftPV: 0,
    totalRightPV: 0,
    totalMatchedPV: 0,
    totalCarryForward: 0,
    pendingPayoutAmount: 0,
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    networkOverview,
    globalBinaryMetrics,
    agentsList,
    totalCount,
    totalPages,
    monthlyTrend: monthlyTrendRaw || [],
  };
};

export const getPaginatedAgents = async ({
  search,
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
  exportData = false,
}) => {
  const query = {};

  // 1. Full text / Regex search
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { agentCode: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
    ];
  }

  // 2. Multi-field Filters
  if (status) query.status = status;
  if (role) query.role = role;
  if (rank) query.rank = rank;
  if (kycStatus) query.kycStatus = kycStatus;

  // 3. Date Range Search
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;

  // Execute Db Query
  let agentQuery = userModel.find(query).select("-password -__v").sort(sort);

  if (!exportData) {
    agentQuery = agentQuery.skip(skip).limit(Number(limit));
  }

  const [agents, totalCount] = await Promise.all([
    agentQuery.lean(),
    userModel.countDocuments(query),
  ]);

  const totalPages = exportData ? 1 : Math.ceil(totalCount / limit);

  return {
    agents,
    pagination: {
      totalCount,
      totalPages,
      currentPage: Number(page),
      limit: exportData ? totalCount : Number(limit),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};