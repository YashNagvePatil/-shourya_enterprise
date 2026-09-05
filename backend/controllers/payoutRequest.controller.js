import mongoose from "mongoose";
import franchiseModel, { FRANCHISE_TYPES } from "../models/franchise.model.js";
import PayoutRequest from "../models/payoutRequest.model.js";
import FinancialPayout from "../models/financialPayout.model.js";
import WalletTransaction from "../models/walletTransactionModel.js";
import orderModel from "../models/order.model.js";
import supplyRequestModel from "../models/supplyRequest.model.js";

/**
 * Helper to calculate monthly payout breakdown for a franchise
 */
export const calculateFranchisePayoutInternal = async (franchiseId) => {
  const franchise = await franchiseModel.findById(franchiseId);
  if (!franchise) throw new Error("Franchise not found");

  const fType = franchise.franchiseType;
  const planConfig = FRANCHISE_TYPES[fType] || { roi: 0, rent: 0, commPercent: 0, commPerProduct: 0 };

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  const monthStart = new Date(currentYear, currentMonth - 1, 1);
  const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  let roiAmount = planConfig.roi || 0;
  let rentAmount = planConfig.rent || 0;
  let commissionAmount = 0;

  let underFranchiseSales = 0;
  let underFranchiseCount = 0;
  let productSalesCount = 0;
  let calculationNote = "";

  if (fType === "STATE") {
    // Under STATE franchise: Only CITY franchises (not district or village)
    const cityFranchises = await franchiseModel.find({
      franchiseType: "CITY",
      status: "Active",
      $or: [
        { parentFranchiseId: franchise._id },
        { "address.state": franchise.address?.state }
      ]
    });

    underFranchiseCount = cityFranchises.length;
    const cityIds = cityFranchises.map((f) => f._id);

    if (cityIds.length > 0) {
      // Calculate total monthly sales of under CITY franchises
      const salesAgg = await supplyRequestModel.aggregate([
        {
          $match: {
            requesterFranchise: { $in: cityIds },
            status: "DELIVERED",
            createdAt: { $gte: monthStart, $lte: monthEnd }
          }
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      underFranchiseSales = salesAgg[0]?.total || 0;
    }

    commissionAmount = (underFranchiseSales * (planConfig.commPercent || 1.5)) / 100;
    calculationNote = `1.5% commission on ₹${underFranchiseSales.toLocaleString()} sales from ${underFranchiseCount} City franchises`;
  } else if (fType === "CITY") {
    // Under CITY franchise: DISTRICT franchises
    const districtFranchises = await franchiseModel.find({
      franchiseType: "DISTRICT",
      status: "Active",
      $or: [
        { parentFranchiseId: franchise._id },
        { "address.district": franchise.address?.district },
        { "address.city": franchise.address?.city }
      ]
    });

    underFranchiseCount = districtFranchises.length;
    const districtIds = districtFranchises.map((f) => f._id);

    if (districtIds.length > 0) {
      const salesAgg = await supplyRequestModel.aggregate([
        {
          $match: {
            requesterFranchise: { $in: districtIds },
            status: "DELIVERED",
            createdAt: { $gte: monthStart, $lte: monthEnd }
          }
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      underFranchiseSales = salesAgg[0]?.total || 0;
    }

    commissionAmount = (underFranchiseSales * (planConfig.commPercent || 1.5)) / 100;
    calculationNote = `1.5% commission on ₹${underFranchiseSales.toLocaleString()} sales from ${underFranchiseCount} District franchises`;
  } else if (fType === "DISTRICT") {
    // Under DISTRICT franchise: VILLAGE franchises (2% commission) + ₹500 per product sale
    const villageFranchises = await franchiseModel.find({
      franchiseType: "VILLAGE",
      status: "Active",
      $or: [
        { parentFranchiseId: franchise._id },
        { "address.district": franchise.address?.district }
      ]
    });

    underFranchiseCount = villageFranchises.length;
    const villageIds = villageFranchises.map((f) => f._id);

    if (villageIds.length > 0) {
      const salesAgg = await supplyRequestModel.aggregate([
        {
          $match: {
            requesterFranchise: { $in: villageIds },
            status: "DELIVERED",
            createdAt: { $gte: monthStart, $lte: monthEnd }
          }
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      underFranchiseSales = salesAgg[0]?.total || 0;
    }

    // Direct product sales count for District Franchise
    const ownSalesCountAgg = await supplyRequestModel.aggregate([
      {
        $match: {
          requesterFranchise: franchise._id,
          status: "DELIVERED",
          createdAt: { $gte: monthStart, $lte: monthEnd }
        }
      },
      { $unwind: "$items" },
      { $group: { _id: null, totalQty: { $sum: "$items.quantity" } } }
    ]);
    productSalesCount = ownSalesCountAgg[0]?.totalQty || 0;

    const villageComm = underFranchiseCount > 0 ? (underFranchiseSales * 2) / 100 : 0;
    const productComm = productSalesCount * (planConfig.commPerProduct || 500);

    commissionAmount = villageComm + productComm;
    calculationNote = `2% comm on Village sales (₹${villageComm.toLocaleString()}) + ₹500/product (${productSalesCount} sales = ₹${productComm.toLocaleString()})`;
  } else if (fType === "VILLAGE") {
    // VILLAGE: ₹500 per product sale, ROI ₹5000, Rent ₹0
    const ownSalesCountAgg = await supplyRequestModel.aggregate([
      {
        $match: {
          requesterFranchise: franchise._id,
          status: "DELIVERED",
          createdAt: { $gte: monthStart, $lte: monthEnd }
        }
      },
      { $unwind: "$items" },
      { $group: { _id: null, totalQty: { $sum: "$items.quantity" } } }
    ]);
    productSalesCount = ownSalesCountAgg[0]?.totalQty || 0;

    commissionAmount = productSalesCount * (planConfig.commPerProduct || 500);
    calculationNote = `₹500 per product sale (${productSalesCount} sales = ₹${commissionAmount.toLocaleString()})`;
  }

  const totalAmount = roiAmount + rentAmount + commissionAmount;

  return {
    franchise,
    month: currentMonth,
    year: currentYear,
    roiAmount,
    rentAmount,
    commissionAmount,
    totalAmount,
    details: {
      underFranchiseSales,
      underFranchiseCount,
      productSalesCount,
      note: calculationNote
    }
  };
};

/**
 * @desc    Get Franchise Payout Calculation & Eligibility (5th date check)
 * @route   GET /api/v1/franchise/financials/payout-calculation
 * @access  Private (Franchise)
 */
export const getFranchisePayoutCalculation = async (req, res) => {
  try {
    const franchiseId = req.user.id;
    const calculation = await calculateFranchisePayoutInternal(franchiseId);

    const todayDate = new Date().getDate();
    const isEligibleDate = todayDate === 5; // Date 5 restriction

    // Check if payout request already created for current month
    const existingRequest = await PayoutRequest.findOne({
      franchiseId,
      month: calculation.month,
      year: calculation.year
    });

    return res.status(200).json({
      success: true,
      data: {
        ...calculation,
        todayDate,
        isEligibleDate,
        existingRequest: existingRequest || null
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Submit Monthly Payout Request (Restricted to 5th date of month)
 * @route   POST /api/v1/franchise/financials/payout-request
 * @access  Private (Franchise)
 */
export const createPayoutRequest = async (req, res) => {
  try {
    const franchiseId = req.user.id;
    const todayDate = new Date().getDate();

    // 1. Strict Date Guard (Allowed only on Date 5 of the month, or with force override for testing)
    const allowOverride = req.body.force === true || req.query.force === "true";
    if (todayDate !== 5 && !allowOverride) {
      return res.status(400).json({
        success: false,
        message: `Payout requests are only allowed on the 5th of every month. Today is date ${todayDate}.`
      });
    }

    const calculation = await calculateFranchisePayoutInternal(franchiseId);
    const { franchise, month, year, roiAmount, rentAmount, commissionAmount, totalAmount, details } = calculation;

    // 2. Prevent Duplicate Monthly Requests
    const existing = await PayoutRequest.findOne({ franchiseId, month, year });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Payout request for ${month}/${year} has already been generated.`
      });
    }

    // 3. Create Payout Request Document
    const payoutReq = new PayoutRequest({
      franchiseId: franchise._id,
      franchiseType: franchise.franchiseType,
      month,
      year,
      roiAmount,
      rentAmount,
      commissionAmount,
      totalAmount,
      details,
      status: "PENDING",
      bankSnapshot: franchise.bankDetails ? {
        accountHolder: franchise.bankDetails.accountHolder,
        bankName: franchise.bankDetails.bankName,
        accountNumber: franchise.bankDetails.accountNumber,
        ifscCode: franchise.bankDetails.ifscCode
      } : null
    });

    await payoutReq.save();

    return res.status(201).json({
      success: true,
      message: `Monthly payout request of ₹${totalAmount.toLocaleString()} submitted successfully for Admin review.`,
      payoutRequest: payoutReq
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Franchise Payout Request History
 * @route   GET /api/v1/franchise/financials/payout-requests
 * @access  Private (Franchise)
 */
export const getFranchisePayoutRequests = async (req, res) => {
  try {
    const franchiseId = req.user.id;
    const requests = await PayoutRequest.find({ franchiseId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get All Monthly Payout Requests for Admin Settlement Portal
 * @route   GET /api/v1/admin/financials/monthly-payout-requests
 * @access  Private (Admin)
 */
export const getAdminPayoutRequests = async (req, res) => {
  try {
    const { status } = req.query; // 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ALL'
    const query = {};
    if (status && status !== "ALL") {
      query.status = status;
    }

    const requests = await PayoutRequest.find(query)
      .populate("franchiseId", "fullName email mobile franchiseType bankDetails address wallet")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Process/Accept/Reject Monthly Payout Request (Admin Manual Action)
 * @route   PATCH /api/v1/admin/financials/monthly-payout-request/:requestId
 * @access  Private (Admin)
 */
export const processAdminPayoutRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId } = req.params;
    const { status, transactionRef, rejectionReason } = req.body; // 'ACCEPTED' | 'REJECTED'

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Status must be ACCEPTED or REJECTED" });
    }

    const payoutReq = await PayoutRequest.findById(requestId).session(session);
    if (!payoutReq || payoutReq.status !== "PENDING") {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Pending payout request not found." });
    }

    const franchise = await franchiseModel.findById(payoutReq.franchiseId).session(session);
    if (!franchise) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Associated franchise not found." });
    }

    if (status === "ACCEPTED") {
      if (!transactionRef) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: "Transaction reference / UTR number is required for accepting payout." });
      }

      const balanceBefore = franchise.wallet?.balance || 0;
      const balanceAfter = balanceBefore + payoutReq.totalAmount;

      franchise.wallet.balance = balanceAfter;
      franchise.wallet.totalEarnings = (franchise.wallet.totalEarnings || 0) + payoutReq.totalAmount;
      await franchise.save({ session });

      payoutReq.status = "ACCEPTED";
      payoutReq.transactionRef = transactionRef;
      payoutReq.processedAt = new Date();
      await payoutReq.save({ session });

      // Create Audit Ledger Entry
      await FinancialPayout.create(
        [
          {
            franchiseId: franchise._id,
            amount: payoutReq.totalAmount,
            type: "ROI",
            referenceNo: transactionRef,
            status: "COMPLETED",
            notes: `Monthly Payout Accepted for ${payoutReq.month}/${payoutReq.year} (ROI: ₹${payoutReq.roiAmount}, Rent: ₹${payoutReq.rentAmount}, Comm: ₹${payoutReq.commissionAmount})`,
            processedAt: new Date()
          }
        ],
        { session }
      );

      await WalletTransaction.create(
        [
          {
            franchiseId: franchise._id,
            type: "MONTHLY_PAYOUT",
            amount: payoutReq.totalAmount,
            balanceBefore,
            balanceAfter,
            description: `Monthly Payout Accepted (${payoutReq.month}/${payoutReq.year}) - Ref: ${transactionRef}`,
            referenceId: transactionRef
          }
        ],
        { session }
      );
    } else {
      payoutReq.status = "REJECTED";
      payoutReq.rejectionReason = rejectionReason || "Rejected by Admin";
      payoutReq.processedAt = new Date();
      await payoutReq.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `Monthly payout request for ${franchise.fullName} marked as ${status}.`,
      payoutRequest: payoutReq
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  }
};
