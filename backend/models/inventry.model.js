import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true, 
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Warehouse stock cannot be negative"],
    },
    costPrice: {
      type: Number,
      required: true,
    },
    wholesalerPrice: {
      type: Number, // Price charged when transferring to Franchise
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    location: {
      type: String,
      default: "Main Warehouse",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Inventory ||
  mongoose.model("Inventory", inventorySchema);