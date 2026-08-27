import franchiseModel  from "../../models/franchise.model.js"
import  orderModel  from "../../models/order.model.js"


// Handles high-level network analytics, active franchise counts, and system metrics

export const getDashboardOverview = async (req, res) => {
  try {
    const totalFranchises = await franchiseModel.countDocuments({ status: "Active" });
    const pendingApplications = await franchiseModel.countDocuments({ status: "Pending" });
    
    const countByTier = await franchiseModel.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: "$franchiseType", count: { $sum: 1 } } }
    ]);

    const revenueSummary = await orderModel.aggregate([
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
    const monthlyStats = await orderModel.aggregate([
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