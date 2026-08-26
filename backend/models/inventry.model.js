import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", 
      required: true,
    },
    sku: {
      type: String,
      required: true, 
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    costPrice: {
      type: Number, // Jis price me aapne kharida hai (For profit calculation)
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier", 
    },
    location: {
      type: String,
      default: "Main Warehouse", 
    }
  },
  { timestamps: true }
);

const inventryModel = mongoose.model("Inventory", inventorySchema);

export default inventryModel