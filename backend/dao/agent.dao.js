import userModel from "../models/user.models.js";

// data fetching from agent db
export const getAgentDashboardDataFromDB = async (agentDbId) => {
  
  const agent = await userModel
    .findById(agentDbId)
    .select("-password -adharCardNumber -panCardNumber")
    .populate({
      path: "leftChild",
      select: "fullName distributerId status rank position isActivated createdAt",
    })
    .populate({
      path: "rightChild",
      select: "fullName distributerId status rank position isActivated createdAt",
    });

  return agent;
};

// 2. Recent Direct/Downline Registrations Fetch Karna (Top 5)
export const getRecentDownlinesFromDB = async (distributerId) => {
  return await userModel
    .find({ sponserId: distributerId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("fullName distributerId position status isActivated createdAt");
};