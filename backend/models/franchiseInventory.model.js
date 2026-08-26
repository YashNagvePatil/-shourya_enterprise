const mongoose = require("mongoose");

const franchiseInventorySchema = new mongoose.Schema(
  {
    franchiseId: { type: mongoose.Schema.Types.ObjectId, ref: "Franchise", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    stock: { type: Number, required: true, default: 0 },
    sellingPrice: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FranchiseInventory", franchiseInventorySchema);