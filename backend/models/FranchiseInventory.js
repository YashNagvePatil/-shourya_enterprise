import mongoose from "mongoose";

const franchiseInventorySchema = new mongoose.Schema(
  {
    franchiseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Franchise stock cannot be negative"],
    },
    sellingPrice: {
      type: Number, // Customer end-selling price (For commission/profit calculation)
      required: true,
    },
    lastReplenishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

franchiseInventorySchema.index({ franchiseId: 1, productId: 1 }, { unique: true });

export default mongoose.models.FranchiseInventory ||
  mongoose.model("FranchiseInventory", franchiseInventorySchema);