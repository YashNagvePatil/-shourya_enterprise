// Handles high-level network analytics, active franchise counts, and system metrics
export const getDashboardOverview = async (req, res) => {
  try {
    const totalFranchises = await Franchise.countDocuments({ status: "ACTIVE" });
    const pendingApplications = await Franchise.countDocuments({ status: "PENDING" });
    
    const countByTier = await Franchise.aggregate([
      { $match: { status: "ACTIVE" } },
      { $group: { _id: "$franchiseType", count: { $sum: 1 } } }
    ]);

    const revenueSummary = await Order.aggregate([
      { $match: { paymentStatus: "COMPLETED" } },
      { $group: { _id: null, totalGmv: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } }
    ]);

    return res.status(200).json({
      success: true,
      metrics: {
        totalFranchises,
        pendingApplications,
        tierBreakdown: countByTier,
        gmv: revenueSummary[0]?.totalGmv || 0,
        totalOrders: revenueSummary[0]?.totalOrders || 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getNetworkAnalytics = async (req, res) => {
  try {
    const monthlyStats = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    return res.status(200).json({ success: true, analytics: monthlyStats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};