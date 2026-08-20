import * as agentDao from "../dao/agent.dao.js";
import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";





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

/**
 * Controller to handle binary genealogy network tree retrieval.
 */
export const netWorkTree = async (req, res) => {
  try {
    const agentDbId = req.user.id;

    // Fetch formatted tree data from DAO layer
    const treeData = await agentDao.getNetworkTreeDao(agentDbId);

    if (!treeData) {
      return res.status(404).json({
        success: false,
        message: "Agent record not found!",
      });
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      message: "Genealogy network tree fetched successfully",
      ...treeData,
    });

  } catch (error) {
    console.error("Error in netWorkTree API:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching network tree",
      error: error.message,
    });
  }
};

export const getWalletDetails = async (req, res) => {
  try {
    const agentDbId = req.user.id; // Logged-in agent authenticated ID

    // 1. Database   fetch  wallet and bank details
    // for Security reson   password and  complete KYC card details hide 
    const agent = await agentDao.getAgentWalletDetails(agentDbId);

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

// profilePage has not separate api frontend geting data through dashBoard api 



// Get Authenticated Agent's Cart
export const getCart = async (req, res) => {
  try {
    let cart = await cartModel.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) {
      cart = await cartModel.create({ user: req.user._id, items: [] });
    }
    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add / Update Product in Cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id; // Logged-in Agent ID from Auth Middleware

    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await cartModel.findOne({ user: userId });
    if (!cart) {
      cart = new cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        pv: product.pv || 0,
      });
    }

    cart.calculateTotals();
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove Item from Cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await cartModel.findOne({ user: req.user._id });

    if (cart) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
      cart.calculateTotals();
      await cart.save();
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
