import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  price: { type: Number, required: true },
  pv: { type: Number, default: 0 },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ek agent ka sirf ek active cart hoga
    },
    items: [cartItemSchema],
    totalAmount: { type: Number, default: 0 },
    totalPV: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Total Amount & Total PV calculate karne ka helper
cartSchema.methods.calculateTotals = function () {
  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  this.totalPV = this.items.reduce(
    (sum, item) => sum + item.pv * item.quantity,
    0
  );
};

export default mongoose.model("Cart",cartSchema);