import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    franchiseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: [true, "Franchise ID is required"],
      index: true,
    },
    type: {
      type: String,
      required: [true, "Transaction type is required"],
      enum: {
        values: [
          "RENT",
          "ROI",
          "COMMISSION",
          "CREDIT",
          "DEBIT",
          "WITHDRAWAL", // Original compatibility
          "WITHDRAWAL_REQUEST",
          "WITHDRAWAL_APPROVED",
          "WITHDRAWAL_REFUND",
          "SETTLEMENT",
          "PENALTY",
          "ADJUSTMENT",
          "SUPPLY_PURCHASE" // Supply order ke liye extra safe enum
        ],
        message: "{VALUE} is not a valid transaction type",
      },
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    balanceBefore: {
      type: Number,
      required: [true, "Opening balance before transaction is required"],
      default: 0,
    },
    balanceAfter: {
      type: Number,
      required: [true, "Closing balance after transaction is required"],
      default: 0,
    },
    category: {
      type: String,
      enum: ["INCOME", "EXPENSE", "PAYOUT", "REFUND"],
      default: function () {
        if (
          ["RENT", "ROI", "COMMISSION", "CREDIT", "WITHDRAWAL_REFUND"].includes(
            this.type
          )
        ) {
          return "INCOME";
        }
        return "PAYOUT";
      },
    },
    status: {
      type: String,
      enum: ["COMPLETED", "PENDING", "FAILED", "REVERSED"],
      default: "COMPLETED",
    },
    description: {
      type: String,
      required: [true, "Transaction description is required"],
      trim: true,
    },
    referenceId: {
      type: String, // Holds Supply Order ID, Withdrawal Request ID, etc.
      trim: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes for Passbook & Admin Reports
walletTransactionSchema.index({ franchiseId: 1, createdAt: -1 });
walletTransactionSchema.index({ franchiseId: 1, type: 1, createdAt: -1 });

const WalletTransaction =
  mongoose.models.WalletTransaction ||
  mongoose.model("WalletTransaction", walletTransactionSchema);

export default WalletTransaction;