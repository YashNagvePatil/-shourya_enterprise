import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  price: Number,
  quantity: Number,
  pv: Number,
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    earnedPV: { type: Number, default: 0 },
    bonusPointsEarned: { type: Number, default: 0 },
    receiptNumber: { type: String, required: true, unique: true },
    
    // Payment Status & Future Razorpay Details
    paymentMethod: { type: String, default: "DUMMY_PAYMENT" },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "COMPLETED", // Abhi dummy generation ke liye COMPLETED
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

const orderModel =   mongoose.model("Order", orderSchema);

export default orderModel