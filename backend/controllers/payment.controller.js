import Razorpay from "razorpay";
import crypto from "crypto";
import orderModel from "../models/order.model.js";
import userModel from "../models/user.models.js";
import productModel from "../models/product.model.js";

// Initialize Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Helper function for MLM Level Commission Percentages
 */
const getCommissionPercentage = (level) => {
  const levelCommissions = { 1: 10, 2: 5, 3: 3, 4: 2, 5: 1 };
  return levelCommissions[level] || 0.5;
};

/**
 * @desc    Step 1: Create Razorpay Order
 * @route   POST /api/payment/create-order
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { productId, quantity = 1, amount } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    // 1. Fetch Product details to calculate actual BV/PV (optional adjustment)
    let totalBV = 100;
    let totalPV = 10;
    
    if (productId) {
      const product = await productModel.findById(productId);
      if (product) {
        totalBV = (product.bv || 0) * quantity;
        totalPV = (product.pv || 0) * quantity;
      }
    }

    // 2. Create Order in MongoDB (Unpaid)
    const newOrder = await orderModel.create({
      user: userId,
      products: productId ? [{ product: productId, quantity }] : [],
      totalBV,
      totalPV,
      amount,
      isPaid: false,
    });

    // 3. Create Razorpay Order (Amount must be in paise: ₹1 = 100 paise)
    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${newOrder._id}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: newOrder._id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Error creating Razorpay Order:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Step 2: Verify Razorpay Signature & Distribute MLM Points
 * @route   POST /api/payment/verify-and-distribute
 */
export const verifyAndDistributeMLM = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
    } = req.body;

    const userId = req.user._id;

    // 1. Signature Verification Check
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed! Invalid Signature.",
      });
    }

    // 2. Fetch Order from DB
    const existingOrder = await orderModel.findById(dbOrderId);
    if (!existingOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (existingOrder.isPaid) {
      return res.status(400).json({ success: false, message: "Order is already processed" });
    }

    const totalBV = existingOrder.totalBV || 0;
    const totalPV = existingOrder.totalPV || 0;

    // 3. Mark Order as Paid
    const updatedOrder = await orderModel.findByIdAndUpdate(
      dbOrderId,
      {
        isPaid: true,
        paidAt: Date.now(),
        paymentResult: {
          id: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          status: "SUCCESS",
        },
      },
      { new: true }
    );

    // 4. MLM Points Propagation (Parent to Root)
    const purchasingAgent = await userModel.findById(userId);
    let level = 1;

    if (purchasingAgent && purchasingAgent.sponsor) {
      let currentSponsorId = purchasingAgent.sponsor.toString();

      while (currentSponsorId) {
        const sponsorUser = await userModel.findById(currentSponsorId);
        if (!sponsorUser) break;

        await userModel.findByIdAndUpdate(currentSponsorId, {
          $inc: {
            totalBV: totalBV,
            totalPV: totalPV,
            walletBalance: (totalBV * getCommissionPercentage(level)) / 100,
          },
        });

        currentSponsorId = sponsorUser.sponsor ? sponsorUser.sponsor.toString() : null;
        level++;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified & MLM commissions distributed successfully",
      orderId: updatedOrder._id,
      totalUplinesRewarded: level - 1,
    });
  } catch (error) {
    console.error("❌ Error in verifyAndDistributeMLM:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};