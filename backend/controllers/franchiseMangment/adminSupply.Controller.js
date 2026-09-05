import mongoose from "mongoose";
import supplyRequestModel from "../../models/supplyRequest.model.js";
import franchiseModel from "../../models/franchise.model.js";
import WalletTransaction from "../../models/walletTransactionModel.js";

/**
 * @desc    Get Network-wide Supply Requests (With Status Filter & Search)
 * @route   GET /api/admin/supplies
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
        { requestNumber: searchRegex },
        { adminNotes: searchRegex },
      ];
    }

    const requests = await supplyRequestModel
      .find(filter)
      .populate("requesterFranchise", "fullName email franchiseType address mobile")
      .populate("items.productId", "name sku price imageUrl images")
      .populate("fulfilledByFranchise", "fullName franchiseType")
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
 * @desc    Update Status: PENDING -> DISPATCHED / CANCELLED
 * @route   PATCH /api/admin/supplies/:requestId/status
 */
export const updateSupplyDispatchStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId } = req.params;
    const { status, notes } = req.body; // 'DISPATCHED' | 'CANCELLED' | 'FULFILLED'

    const supplyReq = await supplyRequestModel
      .findById(requestId)
      .session(session);

    if (!supplyReq) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Supply request not found" });
    }

    const previousStatus = supplyReq.status;

    // Guard: Terminal State Check
    if (["Fulfilled", "Received", "Cancelled", "Rejected"].includes(previousStatus)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Order is already ${previousStatus}. Cannot change state.`,
      });
    }

    // Normalize status string (e.g. "DISPATCHED" -> "Dispatched")
    let targetStatus = status;
    if (typeof status === "string") {
      const lower = status.toLowerCase();
      if (lower === "dispatched") targetStatus = "Dispatched";
      else if (lower === "fulfilled") targetStatus = "Dispatched"; // Fulfilling by Admin dispatches supply
      else if (lower === "cancelled") targetStatus = "Cancelled";
      else if (lower === "received") targetStatus = "Received";
    }

    const allowedStatuses = ["Dispatched", "Cancelled"];
    if (!allowedStatuses.includes(targetStatus)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Invalid status. Admin can set: Dispatched or Cancelled`,
      });
    }

    supplyReq.status = targetStatus;
    if (notes) supplyReq.adminNotes = notes;
    supplyReq.fulfilledBy = "ADMIN";

    if (targetStatus === "Dispatched") {
      supplyReq.dispatchedAt = new Date();
      supplyReq.dispatchNotes = notes || "";
    }

    const franchise = await franchiseModel.findById(supplyReq.requesterFranchise).session(session);

    // Logic for Order CANCELLED (Refund/Unhold Money)
    if (status === "Cancelled" && franchise) {
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

    // Re-fetch with populated data for response
    const updatedReq = await supplyRequestModel
      .findById(requestId)
      .populate("requesterFranchise", "fullName email franchiseType address mobile")
      .populate("items.productId", "name sku price imageUrl images")
      .session(session);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `Supply Request status updated to ${status}`,
      supplyReq: updatedReq,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin Directly Sends / Dispatches Products to a Franchise
 * @route   POST /api/admin/supplies/send
 */
export const createDirectSupplyDispatch = async (req, res) => {
  try {
    const { targetFranchiseId, items, notes } = req.body;

    if (!targetFranchiseId) {
      return res.status(400).json({ success: false, message: "Target Franchise ID is required" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "At least one product item is required" });
    }

    const franchise = await franchiseModel.findById(targetFranchiseId);
    if (!franchise) {
      return res.status(404).json({ success: false, message: "Target Franchise not found" });
    }

    let totalAmount = 0;
    const formattedItems = [];

    for (const item of items) {
      if (!item.productId) continue;
      const product = await mongoose.model("Product").findById(item.productId);
      const unitPrice = product ? product.price : (item.unitPrice || 0);
      const qty = Number(item.quantity) || 1;
      const subtotal = unitPrice * qty;
      totalAmount += subtotal;

      formattedItems.push({
        productId: item.productId,
        quantity: qty,
        unitPrice,
        subtotal,
      });
    }

    const requestNumber = `SR-ADM-${Date.now().toString().slice(-6)}`;

    const supplyRequest = await supplyRequestModel.create({
      requestNumber,
      requesterFranchise: franchise._id,
      requesterType: franchise.franchiseType || "STATE",
      requesterLocation: franchise.address || {},
      items: formattedItems,
      totalAmount,
      status: "Dispatched",
      fulfilledBy: "ADMIN",
      dispatchedAt: new Date(),
      dispatchNotes: notes || "Direct Product Dispatch by Admin",
      adminNotes: notes || "Direct Product Dispatch by Admin",
    });

    const populatedReq = await supplyRequestModel
      .findById(supplyRequest._id)
      .populate("requesterFranchise", "fullName email franchiseType address mobile")
      .populate("items.productId", "name sku price imageUrl images");

    return res.status(201).json({
      success: true,
      message: `Products dispatched successfully to ${franchise.fullName}!`,
      supplyRequest: populatedReq,
    });
  } catch (error) {
    console.error("Error in createDirectSupplyDispatch:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};