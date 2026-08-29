import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    franchiseId: { type: mongoose.Schema.Types.ObjectId, ref: "Franchise", required: true },
    type: {
      type: String,
      enum: ["COMMISSION", "RENT", "ROI", "SETTLEMENT", "WITHDRAWAL"],
      required: true
    },
    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, required: true },
    referenceId: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("WalletTransaction", walletTransactionSchema);