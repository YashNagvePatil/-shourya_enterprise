import franchiseModel from "../models/franchise.model.js";
import supplyRequestModel from "../models/supplyRequest.model.js";
import franchiseInventoryModel from "../models/franchiseInventory.model.js";
import { uploadToCloudinary } from "../services/storage.service.js";
import { sendTokenResponse } from "../controllers/auth.controller.js"; // Adjust import path to your token file
import { FRANCHISE_TYPES } from "../models/franchise.model.js";
import withdrawalModel from "../models/withdrawalModel.js";
// 1. Specialized Franchise Registration
export const registerFranchise = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      mobile,
      franchiseType,
      address,
      udyamNumber,
      firmDocs,          // Base64 string
      shopLicense,       // Base64 string
      panNumber,
      panCardImage,      // Base64 string
      aadhaarNumber,
      aadhaarCardImage,  // Base64 string
      bankDetails,
    } = req.body;

    // 1. Existing Franchise Check
    const existingUser = await franchiseModel.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Franchise already exists with this Email or Mobile",
      });
    }

    // 2. Upload images to Cloudinary concurrently
    const [firmDocsResult, shopLicenseResult, panCardResult, aadhaarCardResult] =
      await Promise.all([
        firmDocs ? uploadToCloudinary(firmDocs, "franchise/firm_docs") : null,
        shopLicense ? uploadToCloudinary(shopLicense, "franchise/licenses") : null,
        panCardImage ? uploadToCloudinary(panCardImage, "franchise/pan_cards") : null,
        aadhaarCardImage ? uploadToCloudinary(aadhaarCardImage, "franchise/aadhaar_cards") : null,
      ]);

    // 3. Create Franchise Record with secure URLs
    const newFranchise = new franchiseModel({
      fullName,
      email,
      password,
      mobile,
      franchiseType,
      address,
      udyamNumber,
      firmDocsUrl: firmDocsResult?.url || null,
      shopLicenseUrl: shopLicenseResult?.url || null,
      panNumber,
      panCardImageUrl: panCardResult?.url || null,
      aadhaarNumber,
      aadhaarCardImageUrl: aadhaarCardResult?.url || null,
      bankDetails,
    });

    await newFranchise.save();

    // Attach role explicitly before issuing token
    newFranchise.role = "FRANCHISE";

    // Call external token utility with await
    return await sendTokenResponse(
      newFranchise,
      res,
      "Franchise registered successfully.",
      201
    );

  } catch (error) {
    console.error("❌ Error in registerFranchise:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error during registration",
    });
  }
};

// 2. Specialized Franchise Login
export const loginFranchise = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const franchise = await franchiseModel.findOne({ email });
    if (!franchise) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Leverages Mongoose schema comparePassword method
    const isMatch = await franchise.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (franchise.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: `Account is currently ${franchise.status}. Contact Admin for verification.`,
      });
    }

    // Attach role explicitly before issuing token
    franchise.role = "FRANCHISE";

    // Call external token utility with await
    return await sendTokenResponse(franchise, res, "Franchise logged in successfully", 200);

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Fetch Franchise Profile & Overview
export const getFranchiseProfile = async (req, res) => {
  try {
    const franchiseId = req.user.id;

    // 1. Fetch relevant fields explicitly (Data Protection & Performance)
    const franchise = await franchiseModel
      .findById(franchiseId)
      .select(
        "fullName email phone outletName outletAddress franchiseType status bankDetails createdAt avatar"
      );

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: "Franchise partner profile not found",
      });
    }

    // 2. Safe Fallback for Franchise Plan/Type Config
    const planConfig = FRANCHISE_TYPES[franchise.franchiseType] || {
      name: franchise.franchiseType || "Standard",
      roi: 0,
      rent: 0,
      commPerProduct: 0,
      commPercent: 0,
    };

    // 3. Helper checks for UX Badges & Alerts
    const isBankConfigured = Boolean(
      franchise.bankDetails &&
        franchise.bankDetails.accountNumber &&
        franchise.bankDetails.ifscCode
    );

    // 4. Return Clean & Structured Response
    res.status(200).json({
      success: true,
      data: {
        personalInfo: {
          id: franchise._id,
          fullName: franchise.fullName,
          email: franchise.email,
          phone: franchise.phone,
          avatar: franchise.avatar || null,
          joinedAt: franchise.createdAt,
        },
        outletInfo: {
          outletName: franchise.outletName,
          outletAddress: franchise.outletAddress,
          franchiseType: franchise.franchiseType,
          status: franchise.status || "ACTIVE", // e.g., ACTIVE, PENDING, SUSPENDED
        },
        planBenefits: {
          typeName: planConfig.name || franchise.franchiseType,
          monthlyRoi: planConfig.roi || 0,
          monthlyRent: planConfig.rent || 0,
          commission: {
            perProduct: planConfig.commPerProduct || 0,
            percent: planConfig.commPercent || 0,
          },
        },
        bankDetails: franchise.bankDetails || null,
        checks: {
          isBankConfigured: isBankConfigured,
          isProfileComplete: isBankConfigured && Boolean(franchise.outletAddress),
        },
      },
    });
  } catch (error) {
    console.error("Error in getFranchiseProfile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error fetching franchise profile",
      error: error.message,
    });
  }
};

import withdrawalModel from "../models/withdrawalModel.js";
import mongoose from "mongoose";

export const getDashboardAnalytics = async (req, res) => {
  try {
    const franchiseId = new mongoose.Types.ObjectId(req.user.id);
    const { filter = "monthly" } = req.query; // 'monthly' | 'weekly'

    const currentYear = new Date().getFullYear();

    // 1. Real Aggregation Query on Database (Approved Withdrawals / Earnings)
    const rawEarnings = await withdrawalModel.aggregate([
      {
        $match: {
          franchiseId: franchiseId,
          status: "APPROVED", // Sirf successful/approved earnings
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" }, // Group by Month (1=Jan, 2=Feb, etc.)
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 2. Map MongoDB Month Numbers (1-12) to Month Names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Maximum amount to calculate dynamic bar heights percentage (0% to 100%)
    const maxAmount = Math.max(...rawEarnings.map((item) => item.totalAmount), 1);

    // 3. Construct Final Dynamic Chart Data
    const analytics = monthNames.map((month, index) => {
      const found = rawEarnings.find((item) => item._id === index + 1);
      const amount = found ? found.totalAmount : 0;
      
      // Calculate height percentage relative to highest earning month
      const heightPercent = amount > 0 ? Math.round((amount / maxAmount) * 100) : 5;

      return {
        label: month,
        amount: amount,
        heightPercentage: `${heightPercent}%`,
      };
    });

    res.status(200).json({
      success: true,
      filter,
      analytics,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// 4. Create Supply Request (Hierarchy-based Visibility)
export const createSupplyRequest = async (req, res) => {
  try {
    const { items } = req.body;
    const franchise = await franchiseModel.findById(req.user.id);

    let visibility = { district: false, state: false, admin: true };

    if (franchise.franchiseType === "VILLAGE") {
      visibility.district = true;
      visibility.state = true;
    } else if (franchise.franchiseType === "DISTRICT") {
      visibility.state = true;
    }

    const supplyRequest = new supplyRequestModel({
      requestNumber: `REQ-${Date.now()}`,
      requesterFranchise: franchise._id,
      requesterType: franchise.franchiseType,
      requesterLocation: franchise.address,
      items,
      visibleTo: visibility,
    });

    await supplyRequest.save();

    res.status(201).json({ success: true, message: "Supply request submitted", supplyRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Fetch Supply Requests based on Hierarchy Role
export const getSupplyRequestsForHierarchy = async (req, res) => {
  try {
    const franchise = await franchiseModel.findById(req.user.id);
    let filter = {};

    if (franchise.franchiseType === "DISTRICT") {
      filter = {
        "visibleTo.district": true,
        "requesterLocation.district": franchise.address.district,
      };
    } else if (franchise.franchiseType === "STATE") {
      filter = {
        "visibleTo.state": true,
        "requesterLocation.state": franchise.address.state,
      };
    } else {
      // Village level views own requests only
      filter = { requesterFranchise: franchise._id };
    }

    const requests = await supplyRequestModel.find(filter)
      .populate("requesterFranchise", "fullName mobile franchiseType address")
      .populate("items.productId", "name category price");

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Inventory Management (Sell from inventory / update stock)
export const getInventory = async (req, res) => {
  try {
    const inventory = await franchiseInventoryModel.find({ franchiseId: req.user.id })
      .populate("productId");
    res.status(200).json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sellFromInventory = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const inventoryItem = await franchiseInventoryModel.findOne({
      franchiseId: req.user.id,
      productId,
    });

    if (!inventoryItem || inventoryItem.stock < quantity) {
      return res.status(400).json({ success: false, message: "Insufficient stock in inventory" });
    }

    inventoryItem.stock -= quantity;
    await inventoryItem.save();

    // Trigger Commission Updates to Franchise Wallet
    const franchise = await franchiseModel.findById(req.user.id);
    const benefits = FRANCHISE_TYPES[franchise.franchiseType];

    let commissionEarned = 0;
    if (benefits.commPerProduct) {
      commissionEarned += benefits.commPerProduct * quantity;
    }
    if (benefits.commPercent) {
      commissionEarned += ((inventoryItem.sellingPrice * quantity) * benefits.commPercent) / 100;
    }

    franchise.wallet.totalCommission += commissionEarned;
    franchise.wallet.totalEarnings += commissionEarned;
    await franchise.save();

    res.status(200).json({
      success: true,
      message: "Sale processed successfully",
      remainingStock: inventoryItem.stock,
      commissionEarned,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Financial Overview (ROI, Rent, & Commissions)
export const getFinancialOverview = async (req, res) => {
  try {
    const franchiseId = req.user.id;

    // 1. Fetch Franchise with Wallet & Bank details
    const franchise = await franchiseModel
      .findById(franchiseId)
      .select("wallet franchiseType bankDetails fullName email");

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: "Franchise partner account not found",
      });
    }

    // 2. Safe Fallback for Benefits Config
    const benefits = FRANCHISE_TYPES[franchise.franchiseType] || {
      roi: 0,
      rent: 0,
      commPerProduct: 0,
      commPercent: 0,
    };

    // 3. Fetch Active Pending Withdrawal Request (If Any)
    const activePendingWithdrawal = await withdrawalModel.findOne({
      franchiseId: franchiseId,
      status: "PENDING",
    }).select("amount createdAt status");

    // 4. Construct Structured Response
    res.status(200).json({
      success: true,
      financials: {
        // Wallet Breakdown
        wallet: {
          balance: franchise.wallet?.balance || 0,
          pendingRent: franchise.wallet?.pendingRent || 0,
          pendingRoi: franchise.wallet?.pendingRoi || 0,
          totalEarned: franchise.wallet?.totalEarned || 0,
          totalWithdrawn: franchise.wallet?.totalWithdrawn || 0,
        },
        
        // Fixed Benefits Configuration
        fixedBenefits: {
          monthlyRoi: benefits.roi || 0,
          monthlyRent: benefits.rent || 0,
          commissionStructure: {
            perProduct: benefits.commPerProduct || 0,
            percent: benefits.commPercent || 0,
          },
        },

        // Bank Account Verification Status
        bankDetails: franchise.bankDetails || null,
        isBankDetailsProvided: Boolean(
          franchise.bankDetails && franchise.bankDetails.accountNumber
        ),

        // Active Lock Check for Payout Requests
        activePendingWithdrawal: activePendingWithdrawal || null,
      },
    });
  } catch (error) {
    console.error("Error in getFinancialOverview:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error fetching financial overview",
      error: error.message,
    });
  }
};