import userModel from "../models/user.models.js";

// data fetching from agent db
export const getAgentDataFromDB = async (agentDbId) => {
  
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

export const getAgentWalletDetails = async (agentDbId) => {
  // Use findById to filter specifically by the agent's ID before selecting attributes
  const agent = await userModel
    .findById(agentDbId)
    .select(
      "walletBalance totalEarning totalWithdrawn pendingPayout totalMatchingBonus totalDirectBonus bankDetails kycStatus"
    );

  return agent;
};


/**
 * Data Access Object (DAO) for Network Tree
 * Fetches genealogy data from MongoDB and formats the tree structure and stats.
 */
export const getNetworkTreeDao = async (agentDbId) => {
  // Fetch agent with nested binary child details
  const agent = await userModel
    .findById(agentDbId)
    .populate({
      path: "leftChild",
      select: "fullName distributerId rank isActivated status position leftChild rightChild",
      populate: {
        path: "leftChild rightChild",
        select: "fullName distributerId rank isActivated status position",
      },
    })
    .populate({
      path: "rightChild",
      select: "fullName distributerId rank isActivated status position leftChild rightChild",
      populate: {
        path: "leftChild rightChild",
        select: "fullName distributerId rank isActivated status position",
      },
    })
    .lean(); // Converts Mongoose document into plain JS object for performance

  if (!agent) {
    return null;
  }

  // Format uniform tree schema for frontend rendering
  const treeStructure = {
    _id: agent._id,
    fullName: agent.fullName,
    distributerId: agent.distributerId,
    rank: agent.rank,
    isActivated: agent.isActivated,
    status: agent.status,
    position: agent.position,
    leftChild: agent.leftChild || null,
    rightChild: agent.rightChild || null,
  };

  // Calculate binary team statistics
  const binaryStats = {
    activeTeamCount: (agent.activeLeftAgents || 0) + (agent.activeRightAgents || 0),
    totalLeftAgents: agent.totalLeftAgents || 0,
    totalRightAgents: agent.totalRightAgents || 0,
    activeLeftAgents: agent.activeLeftAgents || 0,
    activeRightAgents: agent.activeRightAgents || 0,
    leftBV: agent.leftBV || 0,
    rightBV: agent.rightBV || 0,
  };

  return {
    binaryStats,
    treeNodes: treeStructure,
  };
};