import mongoose from "mongoose";

const agentTransactionSchema = new mongoose.Schema(
  {
    // Unique Public Transaction Identifier
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `TXN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`,
    },

    // Agent Reference
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: [true, "Agent ID is required"],
    },

    // Transaction Amount
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    // Transaction Flow Direction
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
    },

    // Current Status of Transaction
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Rejected"],
      default: "Completed",
    },

    // Display Title & Description
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

    // Optional Referral Traceability
    triggeredByAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      default: null,
    },

    // Bank Payout Reference
    payoutRefDetails: {
      utrNumber: { type: String, default: null },
      paymentGateway: { type: String, default: null },
      failureReason: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// 1. Partial Unique Index: Restricts agent from submitting multiple concurrent 'Pending Withdrawal' requests
agentTransactionSchema.index(
  { agentId: 1, category: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "Pending", category: "Withdrawal" } }
);

// 2. High-Performance Index: Optimized for fetching agent transaction history sorted by newest first
agentTransactionSchema.index({ agentId: 1, createdAt: -1 });

const AgentTransaction = mongoose.model("AgentTransaction", agentTransactionSchema);

export default AgentTransaction;