import mongoose from "mongoose"
import franchiseModel from "../models/franchise.model.js";
import supplyRequestModel from "../models/supplyRequest.model.js";
import franchiseInventoryModel from "../models/franchiseInventory.model.js";
import { uploadToCloudinary } from "../services/storage.service.js";
import { sendTokenResponse } from "../controllers/auth.controller.js"; // Adjust import path to your token file
import { FRANCHISE_TYPES } from "../models/franchise.model.js";
import withdrawalModel from "../models/withdrawalModel.js";
import WalletTransaction from "../models/walletTransactionModel.js";
import WithdrawalRequest from "../models/withdrawalRequest.model.js";
import productModel from "../models/product.model.js"
import FranchiseInventory from "../models/FranchiseInventory.js";


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

/**
 * @desc    Get Complete Financial Overview & Wallet Summary for Logged-in Franchise
 * @route   GET /api/v1/franchise/financials/overview
 * @access  Private (Franchise)
 */
export const getFranchiseFinancialOverview = async (req, res) => {
  try {
    const franchiseId = req.user.id;

    // 1. Fetch Franchise Profile & Wallet Details
    const franchise = await franchiseModel.findById(franchiseId).select("wallet bankDetails status");
    if (!franchise) {
      return res.status(404).json({ success: false, message: "Franchise account not found." });
    }

    // 2. Fetch Active Pending Withdrawal Request (if any)
    const activePendingWithdrawal = await WithdrawalRequest.findOne({
      franchiseId,
      status: "PENDING",
    }).sort({ createdAt: -1 });

    // 3. Aggregate Total Withdrawn (Approved Payouts)
    const totalWithdrawnAgg = await WithdrawalRequest.aggregate([
      { $match: { franchiseId: new mongoose.Types.ObjectId(franchiseId), status: "APPROVED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // 4. Aggregate Total Earnings across all payout types
    const totalEarnedAgg = await WalletTransaction.aggregate([
      {
        $match: {
          franchiseId: new mongoose.Types.ObjectId(franchiseId),
          type: { $in: ["RENT", "ROI", "COMMISSION", "CREDIT"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return res.status(200).json({
      success: true,
      financials: {
        wallet: {
          balance: franchise.wallet?.balance || 0,
          pendingRent: franchise.wallet?.pendingRent || 0,
          pendingRoi: franchise.wallet?.pendingRoi || 0,
          totalEarned: totalEarnedAgg[0]?.total || 0,
          totalWithdrawn: totalWithdrawnAgg[0]?.total || 0,
        },
        bankDetailsConfigured: Boolean(
          franchise.bankDetails?.accountNumber && franchise.bankDetails?.ifscCode
        ),
        activePendingWithdrawal: activePendingWithdrawal || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Wallet Transaction Passbook (Ledger Audit Trail) with Pagination & Filters
 * @route   GET /api/v1/franchise/financials/passbook
 * @access  Private (Franchise)
 */
export const getFranchisePassbook = async (req, res) => {
  try {
    const franchiseId = req.user.id;
    const { page = 1, limit = 10, type, startDate, endDate } = req.query;

    const query = { franchiseId };

    // Filter by Payout/Transaction Type
    if (type && type !== "ALL") {
      query.type = type;
    }

    // Filter by Date Range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, totalRecords] = await Promise.all([
      WalletTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      WalletTransaction.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          totalRecords,
          currentPage: Number(page),
          totalPages: Math.ceil(totalRecords / Number(limit)),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Submit New Payout Withdrawal Request (ACID Transaction)
 * @route   POST /api/v1/franchise/financials/withdraw
 * @access  Private (Franchise)
 */
export const requestWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const franchiseId = req.user.id;
    const { amount, notes } = req.body;

    const withdrawAmount = Number(amount);

    // Validation 1: Positive Amount
    if (!withdrawAmount || withdrawAmount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Valid withdrawal amount is required." });
    }

    // Validation 2: Check Existing Pending Request (Strict 1-at-a-time restriction)
    const existingPending = await WithdrawalRequest.findOne({
      franchiseId,
      status: "PENDING",
    }).session(session);

    if (existingPending) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "You already have an active pending withdrawal request under Admin review.",
      });
    }

    // Validation 3: Check Wallet Balance & Bank Details
    const franchise = await franchiseModel.findById(franchiseId).session(session);
    if (!franchise) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Franchise account not found." });
    }

    if (!franchise.bankDetails?.accountNumber || !franchise.bankDetails?.ifscCode) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Please complete your Bank Profile details before requesting a payout.",
      });
    }

    const balanceBefore = franchise.wallet?.balance || 0;
    if (balanceBefore < withdrawAmount) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Available balance: ₹${balanceBefore}`,
      });
    }

    // Step 1: Deduct balance from Wallet
    const balanceAfter = balanceBefore - withdrawAmount;
    franchise.wallet.balance = balanceAfter;
    await franchise.save({ session });

    // Step 2: Create Pending Withdrawal Request Record
    const withdrawalDoc = await WithdrawalRequest.create(
      [
        {
          franchiseId,
          amount: withdrawAmount,
          status: "PENDING",
          bankSnapshot: {
            accountNumber: franchise.bankDetails.accountNumber,
            ifscCode: franchise.bankDetails.ifscCode,
            bankName: franchise.bankDetails.bankName,
            accountHolderName: franchise.bankDetails.accountHolderName,
          },
          notes,
          requestedAt: new Date(),
        },
      ],
      { session }
    );

    // Step 3: Create Wallet Passbook Debit Entry
    await WalletTransaction.create(
      [
        {
          franchiseId,
          type: "WITHDRAWAL_REQUEST",
          amount: withdrawAmount,
          balanceBefore,
          balanceAfter,
          description: `Withdrawal Request Placed - Awaiting Admin Approval`,
          referenceId: withdrawalDoc[0]._id.toString(),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `Withdrawal request for ₹${withdrawAmount} submitted successfully.`,
      withdrawal: withdrawalDoc[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Cancel Pending Withdrawal Request (Refunds Funds Back to Wallet)
 * @route   POST /api/v1/franchise/financials/withdraw/cancel
 * @access  Private (Franchise)
 */
export const cancelWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const franchiseId = req.user.id;
    const { withdrawalId } = req.body;

    // Fetch Target Request
    const withdrawal = await WithdrawalRequest.findOne({
      _id: withdrawalId,
      franchiseId,
      status: "PENDING",
    }).session(session);

    if (!withdrawal) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "No active PENDING withdrawal request found with this ID.",
      });
    }

    // Fetch Franchise Profile
    const franchise = await franchiseModel.findById(franchiseId).session(session);
    const balanceBefore = franchise.wallet?.balance || 0;
    const balanceAfter = balanceBefore + withdrawal.amount;

    // Refund Funds to Wallet
    franchise.wallet.balance = balanceAfter;
    await franchise.save({ session });

    // Update Withdrawal Request Status
    withdrawal.status = "CANCELLED";
    withdrawal.cancelledAt = new Date();
    await withdrawal.save({ session });

    // Passbook Credit Entry
    await WalletTransaction.create(
      [
        {
          franchiseId,
          type: "WITHDRAWAL_REFUND",
          amount: withdrawal.amount,
          balanceBefore,
          balanceAfter,
          description: `Withdrawal Request Cancelled by Franchise - Funds Refunded`,
          referenceId: withdrawal._id.toString(),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `Withdrawal request cancelled. ₹${withdrawal.amount} refunded to your wallet balance.`,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Dynamic Earnings & Supply Throughput Analytics for Bar Chart Visualizer
 * @route   GET /api/v1/franchise/financials/analytics
 * @access  Private (Franchise)
 */
export const getFranchiseAnalytics = async (req, res) => {
  try {
    const franchiseId = new mongoose.Types.ObjectId(req.user.id);
    const { filter = "monthly" } = req.query; // 'daily' | 'weekly' | 'monthly' | 'yearly'

    const currentYear = new Date().getFullYear();

    // Aggregate Earnings Grouped by Month / Day / Week
    const rawEarnings = await WalletTransaction.aggregate([
      {
        $match: {
          franchiseId,
          type: { $in: ["RENT", "ROI", "COMMISSION", "CREDIT"] },
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const maxAmount = Math.max(...rawEarnings.map((item) => item.totalAmount), 1);

    const analytics = monthLabels.map((month, index) => {
      const found = rawEarnings.find((item) => item._id === index + 1);
      const amount = found ? found.totalAmount : 0;
      const heightPercent = amount > 0 ? Math.round((amount / maxAmount) * 100) : 5;

      return {
        label: month,
        amount,
        heightPercentage: `${heightPercent}%`,
      };
    });

    return res.status(200).json({
      success: true,
      filter,
      analytics,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * =================================================================
 * 1. Create Supply Request (With Validation, Price Calculation & Hold)
 * =================================================================
 */
export const createSupplyRequest = async (req, res) => {
  try {
    const { items } = req.body; // Expected format: [{ productId: "id", quantity: 2 }]

    // --- Validation 1: Check Items Array ---
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one item to place a supply order.",
      });
    }

    // --- Fetch Requester Franchise Details ---
    const franchise = await franchiseModel.findById(req.user.id);
    if (!franchise) {
      return res.status(404).json({ success: false, message: "Franchise account not found." });
    }

    // --- Fetch Real Product Details from Database ---
    const productIds = items.map((i) => i.productId);
    const dbProducts = await productModel.find({
      _id: { $in: productIds },
      isActive: true,
      isAvailableForFranchiseSupply: true, // Ensured only allowed items are ordered
    });

    // Verify all requested items exist and are available for supply
    if (dbProducts.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected items are invalid, inactive, or unavailable for supply.",
      });
    }

    // Map products for fast lookup & Calculate Total Supply Cost
    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));
    let calculatedTotalAmount = 0;

    const validatedItems = items.map((item) => {
      const product = productMap.get(item.productId.toString());
      const qty = Math.max(1, Number(item.quantity) || 1);
      const itemPrice = product.price; // Distributor/Supply Price
      const itemSubtotal = itemPrice * qty;

      calculatedTotalAmount += itemSubtotal;

      return {
        productId: product._id,
        quantity: qty,
        unitPrice: itemPrice,
        subtotal: itemSubtotal,
      };
    });

    // --- Validation 2: Wallet Balance Verification ---
    const currentWalletBalance = franchise.walletBalance || 0;
    if (currentWalletBalance < calculatedTotalAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient Wallet Balance. Total Order Cost: ₹${calculatedTotalAmount}, Available Balance: ₹${currentWalletBalance}`,
      });
    }

    // --- Set Hierarchy Visibility ---
    let visibility = { district: false, state: false, admin: true };
    if (franchise.franchiseType === "VILLAGE") {
      visibility.district = true;
      visibility.state = true;
    } else if (franchise.franchiseType === "DISTRICT") {
      visibility.state = true;
    }

    // --- Build & Save Supply Request ---
    const supplyRequest = new supplyRequestModel({
      requestNumber: `REQ-${Date.now()}`,
      requesterFranchise: franchise._id,
      requesterType: franchise.franchiseType,
      requesterLocation: franchise.address,
      items: validatedItems,
      totalAmount: calculatedTotalAmount,
      status: "PENDING",
      visibleTo: visibility,
    });

    await supplyRequest.save();

    // Populate Product details for clean Instant Frontend Response
    const populatedRequest = await supplyRequestModel
      .findById(supplyRequest._id)
      .populate("items.productId", "name sku category price images imageUrl");

    return res.status(201).json({
      success: true,
      message: "Supply request submitted successfully! Funds are held pending fulfillment.",
      supplyRequest: populatedRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * =================================================================
 * 2. Fetch Supply Requests based on Hierarchy Role + Own Requests
 * =================================================================
 */
export const getSupplyRequestsForHierarchy = async (req, res) => {
  try {
    const franchise = await franchiseModel.findById(req.user.id);
    if (!franchise) {
      return res.status(404).json({ success: false, message: "Franchise not found." });
    }

    let filter = {};

    if (franchise.franchiseType === "DISTRICT") {
      // Sees subordinate village requests IN THEIR DISTRICT + THEIR OWN REQUESTS
      filter = {
        $or: [
          { requesterFranchise: franchise._id },
          {
            "visibleTo.district": true,
            "requesterLocation.district": franchise.address?.district,
          },
        ],
      };
    } else if (franchise.franchiseType === "STATE") {
      // Sees district/village requests IN THEIR STATE + THEIR OWN REQUESTS
      filter = {
        $or: [
          { requesterFranchise: franchise._id },
          {
            "visibleTo.state": true,
            "requesterLocation.state": franchise.address?.state,
          },
        ],
      };
    } else {
      // Village level views own requests only
      filter = { requesterFranchise: franchise._id };
    }

    const requests = await supplyRequestModel
      .find(filter)
      .populate("requesterFranchise", "fullName mobile franchiseType address email")
      .populate("items.productId", "name sku category price images imageUrl unit")
      .sort({ createdAt: -1 }); // Latest orders first

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Inventory Management (Sell from inventory / update stock)


// 1. GET INVENTORY (Optimized with lean & populate fallback)
export const getInventory = async (req, res) => {
  try {
    const franchiseId = req.user.id;

    // lean() query performance boost karti hai read operations ke liye
    const inventory = await franchiseInventoryModel
      .find({ franchiseId })
      .populate({
        path: "productId",
        select: "name sku price category image status",
      })
      .lean();

    // Filters out invalid or deleted product references automatically
    const validInventory = inventory.filter((item) => item.productId != null);

    res.status(200).json({
      success: true,
      count: validInventory.length,
      inventory: validInventory,
    });
  } catch (error) {
    console.error("Error in getInventory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
      error: error.message,
    });
  }
};


// 2. SELL FROM INVENTORY (Atomic Transaction + Race-Condition Safe)
export const sellFromInventory = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, quantity } = req.body;
    const franchiseId = req.user.id;

    // Input Validation
    const parsedQty = Number(quantity);
    if (!productId || isNaN(parsedQty) || parsedQty <= 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Please provide a valid product ID and positive quantity",
      });
    }

    // Atomic Stock Update: Stock check DB level par hota hai concurrency avoid karne ke liye
    const inventoryItem = await franchiseInventoryModel
      .findOneAndUpdate(
        {
          franchiseId,
          productId,
          stock: { $gte: parsedQty }, // Guarantees no negative stock
        },
        { $inc: { stock: -parsedQty } },
        { new: true, session }
      )
      .populate("productId", "price name");

    if (!inventoryItem) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Insufficient stock or item not found in inventory",
      });
    }

    // Fetch Franchise Details
    const franchise = await franchiseModel
      .findById(franchiseId)
      .session(session);

    if (!franchise) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Franchise partner account not found",
      });
    }

    // Benefits Strategy Check
    const benefits = FRANCHISE_TYPES[franchise.franchiseType] || {
      commPerProduct: 0,
      commPercent: 0,
    };

    // Price Fallback (inventory selling price -> populated product price -> 0)
    const unitPrice =
      inventoryItem.sellingPrice ||
      (inventoryItem.productId && inventoryItem.productId.price) ||
      0;

    // Calculate Commission
    let commissionEarned = 0;
    if (benefits.commPerProduct) {
      commissionEarned += benefits.commPerProduct * parsedQty;
    }
    if (benefits.commPercent) {
      commissionEarned += ((unitPrice * parsedQty) * benefits.commPercent) / 100;
    }

    commissionEarned = Number(commissionEarned.toFixed(2));

    // Wallet Atomic Update
    if (!franchise.wallet) {
      franchise.wallet = { balance: 0, totalCommission: 0, totalEarnings: 0 };
    }

    franchise.wallet.balance = (franchise.wallet.balance || 0) + commissionEarned;
    franchise.wallet.totalCommission = (franchise.wallet.totalCommission || 0) + commissionEarned;
    franchise.wallet.totalEarnings = (franchise.wallet.totalEarnings || 0) + commissionEarned;

    await franchise.save({ session });

    // Commit Transaction
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Sale processed successfully",
      data: {
        productId,
        productName: inventoryItem.productId?.name || "Product",
        quantitySold: parsedQty,
        remainingStock: inventoryItem.stock,
        commissionEarned,
        currentWalletBalance: franchise.wallet.balance,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in sellFromInventory:", error);
    res.status(500).json({
      success: false,
      message: "Server error processing sale",
      error: error.message,
    });
  } finally {
    session.endSession();
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