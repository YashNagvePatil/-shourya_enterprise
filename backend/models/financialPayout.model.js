import mongoose from "mongoose";

const financialPayoutSchema = new mongoose.Schema(
  {
    franchiseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Payout amount must be greater than zero"]
    },
    type: {
      type: String,
      enum: ["RENT", "ROI", "COMMISSION"],
      required: true
    },
    referenceNo: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REJECTED"],
      default: "COMPLETED"
    },
    processedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// High-speed analytical indexes for Admin Ledger Reports
financialPayoutSchema.index({ franchiseId: 1, type: 1 });
financialPayoutSchema.index({ referenceNo: 1 }, { unique: true });

export const FinancialPayout =
  mongoose.models.FinancialPayout || mongoose.model("FinancialPayout", financialPayoutSchema);

export default FinancialPayout;