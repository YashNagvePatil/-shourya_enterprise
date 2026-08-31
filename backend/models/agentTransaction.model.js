import mongoose from "mongoose";

const agentTransactionSchema = new mongoose.Schema(
  {
    // Unique Public Transaction Identifier (e.g., TXN1692839210)
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `TXN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`,
    },

    // Agent Reference (Indexed for fast query performance)
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: [true, "Agent ID is required"],
      index: true,
    },

    // Transaction Amount
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    // Transaction Flow Direction (Credit = Money Added, Debit = Payout/Withdrawal)
    transactionType: {
      type: String,
      enum: ["Credit", "Debit"],
      required: [true, "Transaction type (Credit/Debit) is required"],
    },

    // Category of Income/Payout
    category: {
      type: String,
      enum: [
        "BinaryMatchingBonus",
        "DirectReferralBonus",
        "Withdrawal",
        "AdminAdjustment",
        "Refund",
        "Reward",
      ],
      required: [true, "Transaction category is required"],
      index: true,
    },

    // Current Status of Transaction
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Rejected"],
      default: "Completed",
      index: true,
    },

    // User-friendly Display Title & Description
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Dynamic Balance Snapshots (Audit Trail)
    openingBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    closingBalance: {
      type: Number,
      required: true,
      default: 0,
    },

    // Optional Referral Traceability (If earned via another Agent/User)
    triggeredByAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      default: null,
    },

    // Bank Payout Reference (For Withdrawal requests)
    payoutRefDetails: {
      utrNumber: { type: String, default: null }, // Bank UTR or Transaction Ref
      paymentGateway: { type: String, default: null }, // e.g., Razorpay, Manual Bank Transfer
      failureReason: { type: String, default: null },
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt
  }
);

// Compound Index for high-performance agent history pagination
agentTransactionSchema.index({ agentId: 1, createdAt: -1 });

const AgentTransaction = mongoose.model("AgentTransaction", agentTransactionSchema);

export default AgentTransaction;