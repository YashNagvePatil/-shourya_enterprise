const mongoose = require("mongoose");

const supplyRequestSchema = new mongoose.Schema(
  {
    requestNumber: { type: String, unique: true },
    requesterFranchise: { type: mongoose.Schema.Types.ObjectId, ref: "Franchise", required: true },
    requesterType: { type: String, enum: ["VILLAGE", "DISTRICT", "STATE"], required: true },
    requesterLocation: {
      state: String,
      district: String,
      village: String
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true }
      }
    ],
    // Hierarchical Access Controls
    visibleTo: {
      district: { type: Boolean, default: false },
      state: { type: Boolean, default: false },
      admin: { type: Boolean, default: true }
    },
    status: {
      type: String,
      enum: ["Pending", "Fulfilled", "Rejected"],
      default: "Pending"
    },
    fulfilledBy: { type: String, enum: ["DISTRICT", "STATE", "ADMIN"], default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupplyRequest", supplyRequestSchema);