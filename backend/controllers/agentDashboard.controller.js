import * as agentDao from "../dao/agent.dao.js";

export const dashBoard = async (req, res) => {
  try {
    // req.user.id from JWT Authentication 
    const agentDbId = req.user.id;

    // 1. DAO agent data fetchs
    const agent = await agentDao.getAgentDashboardDataFromDB(agentDbId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent record not found!",
      });
    }

    // 2. Recent Downline Joinings Fetch from DAO 
    const recentDownlines = await agentDao.getRecentDownlinesFromDB(agent.distributerId);

    // 3. Dynamic Referral Links Generate 
    // const baseUrl = process.env.CLIENT_URL || "https://yourdomain.com";
    // const leftReferralLink = `${baseUrl}/register?sponsor=${agent.distributerId}&side=left`;
    // const rightReferralLink = `${baseUrl}/register?sponsor=${agent.distributerId}&side=right`;

    // 4. Clean Structured Response Construct 
    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      dashboard: {
        // --- A. Agent Identity & Rank ---
        profile: {
          fullName: agent.fullName,
          distributerId: agent.distributerId,
          role: agent.role,
          rank: agent.rank,
          status: agent.status,
          isActivated: agent.isActivated,
          activationDate: agent.activationDate,
          kycStatus: agent.kycStatus,
        },

        // --- B. Financials & Wallet Balance ---
        wallet: {
          walletBalance: agent.walletBalance,
          totalEarning: agent.totalEarning,
          totalMatchingBonus: agent.totalMatchingBonus,
          totalDirectBonus: agent.totalDirectBonus,
          totalWithdrawn: agent.totalWithdrawn,
          pendingPayout: agent.pendingPayout,
        },

        // --- C. Binary Legs & Business Stats ---
        binaryStats: {
          totalDirects: agent.totalDirects,
          leftLeg: {
            totalAgents: agent.totalLeftAgents,
            activeAgents: agent.activeLeftAgents,
            currentBV: agent.leftBV,
            totalBV: agent.totalLeftBV,
            // referralLink: leftReferralLink,
          },
          rightLeg: {
            totalAgents: agent.totalRightAgents,
            activeAgents: agent.activeRightAgents,
            currentBV: agent.rightBV,
            totalBV: agent.totalRightBV,
            // referralLink: rightReferralLink,
          },
        },

        // --- D. Immediate Direct Binary Tree Nodes ---
        treeNodes: {
          leftChild: agent.leftChild || null,
          rightChild: agent.rightChild || null,
        },

        // --- E. Recent Downlines Table ---
        recentDownlines,
      },
    });
  } catch (error) {
    console.error("[DASHBOARD ERROR]:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load agent dashboard",
      error: error.message,
    });
  }
};