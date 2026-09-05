import mongoose from "mongoose";

const payoutRequestSchema = new mongoose.Schema(
  {
    franchiseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
      index: true
    },
    franchiseType: {
      type: String,
      enum: ["VILLAGE", "CITY", "DISTRICT", "STATE"],
      required: true
    },
    month: { type: Number, required: true }, // 1 - 12
    year: { type: Number, required: true },
    roiAmount: { type: Number, default: 0 },
    rentAmount: { type: Number, default: 0 },
    commissionAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    details: {
      underFranchiseSales: { type: Number, default: 0 },
      underFranchiseCount: { type: Number, default: 0 },
      productSalesCount: { type: Number, default: 0 },
      note: { type: String, default: "" }
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
      index: true
    },
    bankSnapshot: {
      accountHolder: { type: String },
      bankName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String }
    },
    transactionRef: { type: String, default: null },
    rejectionReason: { type: String, default: null },
    processedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// High-speed index & compound unique constraint per franchise per month/year
payoutRequestSchema.index({ franchiseId: 1, month: 1, year: 1 }, { unique: true });
payoutRequestSchema.index({ createdAt: -1 });

export const PayoutRequest =
  mongoose.models.PayoutRequest || mongoose.model("PayoutRequest", payoutRequestSchema);

export default PayoutRequest;
