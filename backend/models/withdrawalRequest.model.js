import mongoose from "mongoose";

const withdrawalRequestSchema = new mongoose.Schema(
  {
    franchiseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: [true, "Franchise ID is required"],
      index: true
    },
    amount: {
      type: Number,
      required: [true, "Withdrawal amount is required"],
      min: [100, "Minimum withdrawal amount is ₹100"] // Set business threshold if needed
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
      index: true
    },
    // Captured Bank Snapshot at the moment of request to prevent historical alteration
    bankSnapshot: {
      accountHolder: { type: String, required: true },
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true }
    },
    // Fields filled by Admin upon approval/rejection
    referenceNo: {
      type: String,
      trim: true,
      default: null
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null
    },
    processedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// High-speed Indexing for Query Optimization
withdrawalRequestSchema.index({ franchiseId: 1, status: 1 });
withdrawalRequestSchema.index({ createdAt: -1 });

export const WithdrawalRequest =
  mongoose.models.WithdrawalRequest || mongoose.model("WithdrawalRequest", withdrawalRequestSchema);

export default WithdrawalRequest;