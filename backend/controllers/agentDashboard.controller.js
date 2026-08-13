import * as agentDao from "../dao/agent.dao.js";

export const dashBoard = async (req, res) => {
  try {
    // req.user.id from JWT Authentication 
    const agentDbId = req.user.id;

    // 1. DAO agent data fetchs
    const agent = await agentDao.getAgentDataFromDB(agentDbId);

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
          email: agent.email,
          phone: agent.phone,
          address: agent.address,
          sponsorName: agent.sponserName || agent.referrer?.fullName || "N/A",
          createdAt: agent.createdAt,
          
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

export const netWorkTree = async (req, res) => {
  try {
    const agentDbId = req.user.id; 

    // 1. fetching current logged in user data and making  populate their left and right child
    // Hum select() ka use karke sensitive data (like password, pan, adhar) ko filter out kar rahe hain
    const agent = await userModel.findById(agentDbId)
      .populate({
        path: "leftChild",
        select: "fullName distributerId rank isActivated status createdAt role"
      })
      .populate({
        path: "rightChild",
        select: "fullName distributerId rank isActivated status createdAt role"
      });

   
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent record not found!"
      });
    }

    // 3. Response 
    return res.status(200).json({
      success: true,
      message: "Genealogy network tree fetched successfully",
      
      // Root Node
      rootNode: {
        id: agent._id,
        fullName: agent.fullName,
        distributerId: agent.distributerId,
        rank: agent.rank,
        isActivated: agent.isActivated,
        status: agent.status,
        sponserName: agent.sponserName,
        totalDirects: agent.totalDirects
      },

      // Left & Right Channels Stats 
      binaryCounters: {
        totalLeftAgents: agent.totalLeftAgents,
        totalRightAgents: agent.totalRightAgents,
        activeLeftAgents: agent.activeLeftAgents,
        activeRightAgents: agent.activeRightAgents,
        leftBV: agent.leftBV,
        rightBV: agent.rightBV
      },

      // Direct Child Nodes Data 
      directChilds: {
        leftChild: agent.leftChild ? {
          id: agent.leftChild._id,
          fullName: agent.leftChild.fullName,
          distributerId: agent.leftChild.distributerId,
          rank: agent.leftChild.rank,
          isActivated: agent.leftChild.isActivated,
          status: agent.leftChild.status,
          side: "Left Leg"
        } : null, // if blank slot shwoing null

        rightChild: agent.rightChild ? {
          id: agent.rightChild._id,
          fullName: agent.rightChild.fullName,
          distributerId: agent.rightChild.distributerId,
          rank: agent.rightChild.rank,
          isActivated: agent.rightChild.isActivated,
          status: agent.rightChild.status,
          side: "Right Leg"
        } : null
      }
    });

  } catch (error) {
    console.error("Error in netWorkTree API:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching network tree",
      error: error.message
    });
  }
};



export const getWalletDetails = async (req, res) => {
  try {
    const agentDbId = req.user.id; // Logged-in agent authenticated ID

    // 1. Database   fetch  wallet and bank details
    // for Security reson   password and  complete KYC card details hide 
    const agent = await agentDao.getAgentDataFromDB(agentDbId).select(
      "walletBalance totalEarning totalWithdrawn pendingPayout totalMatchingBonus totalDirectBonus bankDetails kycStatus"
    );

    // 2. Verification check
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent record not found!"
      });
    }

    // 3. Security Layer:before sending  Bank Account Number response  making them  mask 
    let maskedBankDetails = {
      bankName: agent.bankDetails?.bankName || "N/A",
      ifscCode: agent.bankDetails?.ifscCode || "N/A",
      accountHolderName: agent.bankDetails?.accountHolderName || "N/A",
      accountNumber: "N/A"
    };

    if (agent.bankDetails && agent.bankDetails.accountNumber) {
      const accStr = agent.bankDetails.accountNumber.toString();
      //only four laters are visible 
      maskedBankDetails.accountNumber = `********${accStr.slice(-4)}`;
    }

    // 4.clean api response 
    return res.status(200).json({
      success: true,
      message: "Wallet ledgers fetched successfully",
      
      // Live Core Balances (Wallet Page top summary cards)
      balances: {
        availableBalance: agent.walletBalance || 0,
        totalEarnings: agent.totalEarning || 0,
        totalWithdrawn: agent.totalWithdrawn || 0,
        pendingPayout: agent.pendingPayout || 0
      },

      // Income Category Breakdowns
      earningsBreakdown: {
        binaryMatchingBonus: agent.totalMatchingBonus || 0,
        directReferralBonus: agent.totalDirectBonus || 0
      },

      // Settlement Vault (Target Account for payouts)
      payoutDestination: {
        kycStatus: agent.kycStatus,
        isEligibleForWithdrawal: agent.kycStatus === "Approved", // Agar KYC approved hai tabhi button enable hoga
        bankDetails: maskedBankDetails
      }
    });

  } catch (error) {
    console.error("Error in getWalletDetails API:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching wallet data",
      error: error.message
    });
  }
};