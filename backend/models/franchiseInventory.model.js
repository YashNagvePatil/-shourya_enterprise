import  mongoose  from "mongoose"

const franchiseInventorySchema = new mongoose.Schema(
  {
    franchiseId: { type: mongoose.Schema.Types.ObjectId, ref: "Franchise", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    stock: { type: Number, required: true, default: 0 },
    sellingPrice: { type: Number, required: true }
  },
  { timestamps: true }
);

const franchiseInventoryModel = mongoose.model("FranchiseInventory", franchiseInventorySchema);

export default franchiseInventoryModel