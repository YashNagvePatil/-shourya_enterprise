import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    franchiseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than 0"],
    },
    payoutType: {
      type: String,
      enum: ["RENT", "ROI", "COMMISSION", "GENERAL_WALLET"],
      default: "GENERAL_WALLET",
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    // Audit & Bank Transfer Details
    referenceNo: {
      type: String, // Bank UTR / Transaction ID
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    bankDetailsSnapshot: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      accountHolderName: String,
    },
    processedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const withdrawalModel =
  mongoose.models.Withdrawal || mongoose.model("Withdrawal", withdrawalSchema);

export default withdrawalModel;