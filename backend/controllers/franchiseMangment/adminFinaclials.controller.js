import mongoose from "mongoose";
import franchiseModel from "../../models/franchise.model.js";
import FinancialPayout from "../../models/financialPayout.model.js";
import WalletTransaction from "../../models/walletTransactionModel.js";
import WithdrawalRequest from "../../models/withdrawalRequest.model.js";

/**
 * @desc    Get High-Level System Financial Analytics & Pending Withdrawals
 * @route   GET /api/v1/admin/financials/summary
 * @access  Private (Admin)
 */
export const getFinancialSummary = async (req, res) => {
  try {
    // 1. Group payouts by Type (RENT, ROI, COMMISSION)
    const payouts = await FinancialPayout.aggregate([
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // 2. Aggregate Pending System Liabilities (Rent & ROI pending in wallets)
    const totalLiabilities = await franchiseModel.aggregate([
      {
        $group: {
          _id: null,
          totalPendingRent: { $sum: "$wallet.pendingRent" },
          totalPendingRoi: { $sum: "$wallet.pendingRoi" },
          totalWalletBalance: { $sum: "$wallet.balance" }
        }
      }
    ]);

    // 3. Fetch Pending Withdrawal Requests from Franchises
    const pendingWithdrawals = await WithdrawalRequest.find({ status: "PENDING" })
      .populate("franchiseId", "fullName email mobile franchiseType bankDetails wallet.balance")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        payoutsSummary: payouts,
        systemLiabilities: totalLiabilities[0] || {
          totalPendingRent: 0,
          totalPendingRoi: 0,
          totalWalletBalance: 0
        },
        pendingWithdrawalsCount: pendingWithdrawals.length,
        pendingWithdrawals
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Process Manual Financial Settlement with ACID DB Transaction
 * @route   POST /api/v1/admin/financials/settlement
 * @access  Private (Admin)
 */
export const processSettlement = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { franchiseId, amount, payoutType, referenceNo, notes } = req.body;

    // Validation (Fail Early)
    if (!franchiseId || !amount || amount <= 0 || !payoutType || !referenceNo) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "FranchiseId, positive amount, payoutType, and referenceNo are required."
      });
    }

    // 1. Check for Duplicate Reference Number
    const existingPayout = await FinancialPayout.findOne({ referenceNo }).session(session);
    if (existingPayout) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Payout with Reference Number '${referenceNo}' already processed.`
      });
    }

    // 2. Fetch Franchise
    const franchise = await franchiseModel.findById(franchiseId).session(session);
    if (!franchise) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Franchise not found" });
    }

    const balanceBefore = franchise.wallet.balance || 0;
    const balanceAfter = balanceBefore + Number(amount);

    // 3. Create Immutable Financial Payout Document
    const payout = await FinancialPayout.create(
      [
        {
          franchiseId,
          amount: Number(amount),
          type: payoutType,
          referenceNo,
          status: "COMPLETED",
          notes,
          processedAt: new Date()
        }
      ],
      { session }
    );

    // 4. Update Franchise Wallet Balance
    franchise.wallet.balance = balanceAfter;

    // Deduct liabilities if settling Rent or ROI
    if (payoutType === "RENT" && franchise.wallet.pendingRent > 0) {
      franchise.wallet.pendingRent = Math.max(0, franchise.wallet.pendingRent - Number(amount));
    } else if (payoutType === "ROI" && franchise.wallet.pendingRoi > 0) {
      franchise.wallet.pendingRoi = Math.max(0, franchise.wallet.pendingRoi - Number(amount));
    }

    await franchise.save({ session });

    // 5. Create Audit Trail Entry in Wallet Passbook
    await WalletTransaction.create(
      [
        {
          franchiseId,
          type: payoutType,
          amount: Number(amount),
          balanceBefore,
          balanceAfter,
          description: `Admin Settlement [${payoutType}] - Ref: ${referenceNo}`,
          referenceId: referenceNo
        }
      ],
      { session }
    );

    // Commit Transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `${payoutType} settlement of ₹${amount} processed successfully.`,
      payout: payout[0]
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Approve or Reject Pending Withdrawal Request (NEW CONTROLLER)
 * @route   PATCH /api/v1/admin/financials/withdrawal/:requestId
 * @access  Private (Admin)
 */
export const reviewWithdrawalRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId } = req.params;
    const { status, referenceNo, rejectionReason } = req.body; // 'APPROVED' | 'REJECTED'

    if (!["APPROVED", "REJECTED"].includes(status)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Invalid status status action" });
    }

    const withdrawal = await WithdrawalRequest.findById(requestId).session(session);
    if (!withdrawal || withdrawal.status !== "PENDING") {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Pending withdrawal request not found" });
    }

    const franchise = await franchiseModel.findById(withdrawal.franchiseId).session(session);
    if (!franchise) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Associated Franchise not found" });
    }

    if (status === "APPROVED") {
      if (!referenceNo) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: "Bank reference number required for approval" });
      }

      const balanceBefore = franchise.wallet.balance || 0;
      if (balanceBefore < withdrawal.amount) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: "Franchise balance is insufficient" });
      }

      const balanceAfter = balanceBefore - withdrawal.amount;
      franchise.wallet.balance = balanceAfter;
      await franchise.save({ session });

      withdrawal.status = "APPROVED";
      withdrawal.referenceNo = referenceNo;
      withdrawal.processedAt = new Date();

      // Audit Ledger Entry
      await WalletTransaction.create(
        [
          {
            franchiseId: franchise._id,
            type: "WITHDRAWAL",
            amount: withdrawal.amount,
            balanceBefore,
            balanceAfter,
            description: `Withdrawal Approved - Ref: ${referenceNo}`,
            referenceId: referenceNo
          }
        ],
        { session }
      );
    } else {
      withdrawal.status = "REJECTED";
      withdrawal.rejectionReason = rejectionReason || "Admin rejected the request";
    }

    await withdrawal.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `Withdrawal request ${status.toLowerCase()} successfully`,
      withdrawal
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Detailed Audit Ledger for a Franchise (NEW CONTROLLER)
 * @route   GET /api/v1/admin/financials/ledger/:franchiseId
 * @access  Private (Admin)
 */
export const getFranchiseFinancialLedger = async (req, res) => {
  try {
    const { franchiseId } = req.params;

    const transactions = await WalletTransaction.find({ franchiseId })
      .sort({ createdAt: -1 });

    const payouts = await FinancialPayout.find({ franchiseId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        transactions,
        payouts
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};