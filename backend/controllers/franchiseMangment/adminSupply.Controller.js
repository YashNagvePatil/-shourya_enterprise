import mongoose from "mongoose";
import supplyRequestModel from "../../models/supplyRequest.model.js";
import franchiseModel from "../../models/franchise.model.js";
import WalletTransaction from "../../models/walletTransactionModel.js";

/**
 * @desc    Get Network-wide Supply Requests (With Status Filter & Search)
 * @route   GET /api/v1/admin/supply/requests
 */
export const getGlobalSupplyRequests = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { adminNotes: searchRegex },
      ];
    }

    const requests = await supplyRequestModel
      .find(filter)
      .populate("franchiseId", "fullName email franchiseType address mobile")
      .populate("items.productId", "name sku price")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update Status: PENDING -> FULFILLED / DISPATCHED / CANCELLED
 * @route   PATCH /api/v1/admin/supply/requests/:requestId/status
 */
export const updateSupplyDispatchStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId } = req.params;
    const { status, notes } = req.body; // 'FULFILLED' | 'CANCELLED' | 'DISPATCHED'

    const supplyReq = await supplyRequestModel
      .findById(requestId)
      .session(session);

    if (!supplyReq) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Supply request not found" });
    }

    const previousStatus = supplyReq.status;

    // 1. Guard: Terminal State Check (Ek baar FULFILLED ya CANCELLED hua toh wapas badal nahi sakte)
    if (["FULFILLED", "DELIVERED", "CANCELLED"].includes(previousStatus)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Order is already ${previousStatus}. Cannot change state.`,
      });
    }

    supplyReq.status = status;
    if (notes) supplyReq.adminNotes = notes;

    const franchise = await franchiseModel.findById(supplyReq.franchiseId).session(session);

    // 2. Logic for Order CANCELLED (Refund/Unhold Money)
    if (status === "CANCELLED" && franchise) {
      const refundAmount = supplyReq.totalAmount || 0;
      const balanceBefore = franchise.wallet?.balance || 0;
      const balanceAfter = balanceBefore + refundAmount;

      franchise.wallet.balance = balanceAfter;
      await franchise.save({ session });

      // Passbook Audit Entry
      await WalletTransaction.create(
        [
          {
            franchiseId: franchise._id,
            type: "WITHDRAWAL_REFUND",
            amount: refundAmount,
            balanceBefore,
            balanceAfter,
            description: `Supply Request Cancelled by Admin - Balance Released`,
            referenceId: supplyReq._id.toString(),
          },
        ],
        { session }
      );
    }

    await supplyReq.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `Supply Request status updated to ${status}`,
      supplyReq,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  }
};