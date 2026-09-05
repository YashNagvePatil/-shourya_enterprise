import Razorpay from "razorpay";
import crypto from "crypto";
import orderModel from "../models/order.model.js";
import userModel from "../models/user.models.js";
import productModel from "../models/product.model.js";
import inventryModel from "../models/inventry.model.js";
import cartModel from "../models/cart.model.js";
import { config } from "../config/config.js";
// Initialize Razorpay Instance

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_TEST_API_KEY,
  key_secret:config.RAZORPAY_KEY_SECRET,
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
    const { productId, quantity = 1, amount, items: reqItems } = req.body;
    const userId = req.user._id || req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    let orderItems = [];
    let totalBV = 100;
    let totalPV = 10;

    // A. Single Product Direct Purchase / Buy Now
    if (productId) {
      const product = await productModel.findById(productId);
      if (product) {
        totalBV = (product.bv || 0) * quantity;
        totalPV = (product.pv || 0) * quantity;
        orderItems = [{ product: product._id, quantity, pv: totalPV }];
      }
    } 
    // B. Multiple items passed directly in payload
    else if (Array.isArray(reqItems) && reqItems.length > 0) {
      for (const item of reqItems) {
        const pId = item.productId || item.product;
        const pQty = item.quantity || item.qty || 1;
        const dbProd = await productModel.findById(pId);
        if (dbProd) {
          const itemPV = (dbProd.pv || 0) * pQty;
          totalPV += itemPV;
          totalBV += (dbProd.bv || 0) * pQty;
          orderItems.push({ product: dbProd._id, quantity: pQty, pv: itemPV });
        }
      }
    } 
    // C. Standard Cart Checkout: Fetch active items from User Cart DB
    else {
      const userCart = await cartModel.findOne({ user: userId }).populate("items.product");
      if (userCart && userCart.items?.length > 0) {
        for (const cartItem of userCart.items) {
          const p = cartItem.product;
          if (p) {
            const itemPV = (p.pv || 0) * cartItem.quantity;
            totalPV += itemPV;
            totalBV += (p.bv || 0) * cartItem.quantity;
            orderItems.push({ product: p._id, quantity: cartItem.quantity, pv: itemPV });
          }
        }
      }
    }

    // 2. Create Order in MongoDB (Unpaid)
    const receiptNumber = `REC_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await orderModel.create({
      user: userId,
      items: orderItems,
      totalAmount: amount,
      earnedPV: totalPV,
      receiptNumber: receiptNumber,
      paymentStatus: "PENDING",
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
      keyId: config.RAZORPAY_TEST_API_KEY
    });
  } catch (error) {
    console.error("❌ Error creating Razorpay Order:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Helper: Binary Pair Matching Algorithm
 * Evaluates leftBV and rightBV, processes 500/1000 step matching,
 * updates wallet balance, and handles carry forward points.
 */
const processBinaryPairMatching = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) return;

  const left = user.leftBV || 0;
  const right = user.rightBV || 0;

  // Minimum points across both legs
  const matchedPoints = Math.min(left, right);

  // Matching is valid only if minimum 500 points available on both sides
  if (matchedPoints >= 500) {
    // Round down to the nearest multiple of 500
    const matchedPairsAmount = Math.floor(matchedPoints / 500) * 500;

    // Deduct matched points from active balance (Carry Forward remaining)
    const newLeftBV = left - matchedPairsAmount;
    const newRightBV = right - matchedPairsAmount;

    // 1:1 payout ratio (1 Point = ₹1 Bonus)
    const matchingPayout = matchedPairsAmount;

    await userModel.findByIdAndUpdate(userId, {
      leftBV: newLeftBV,
      rightBV: newRightBV,
      $inc: {
        walletBalance: matchingPayout,
        totalMatchingBonus: matchingPayout,
        totalEarning: matchingPayout,
      },
    });
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
      .createHmac("sha256", config.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET)
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

    if (existingOrder.paymentStatus === "PAID" || existingOrder.isPaid) {
      return res.status(400).json({ success: false, message: "Order is already processed" });
    }

    // ------------------------------------------------------------------
    // RULE 1: Fixed Point System based on Amount Threshold
    // ------------------------------------------------------------------
    const totalAmount = existingOrder.totalAmount || 0;
    const generatedBV = totalAmount >= 13000 ? 1000 : 500;

    // 3. Mark Order as Paid
    const updatedOrder = await orderModel.findByIdAndUpdate(
      dbOrderId,
      {
        isPaid: true,
        paymentStatus: "PAID",
        earnedPV: generatedBV,
        paidAt: Date.now(),
        paymentResult: {
          id: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          status: "SUCCESS",
        },
      },
      { new: true }
    ).populate("items.product", "name price category");

    // Clear user cart upon successful payment
    await cartModel.findOneAndUpdate({ user: userId }, { items: [], totalAmount: 0, totalPV: 0 });

    // 3.5 INVENTORY AUTO-DEDUCTION: Har sold item ki quantity inventory se minus karo
    //     Atomic $inc with $gte guard → concurrent orders mein bhi negative stock nahi hoga
    if (updatedOrder?.items?.length > 0) {
      const deductionPromises = updatedOrder.items.map(async (item) => {
        const productId = item.product?._id || item.product;
        const qty = item.quantity || 1;

        // If inventory entry does not exist yet, auto-create it from productModel
        let existingInventory = await inventryModel.findOne({ product: productId });
        if (!existingInventory) {
          const dbProduct = await productModel.findById(productId);
          if (dbProduct) {
            existingInventory = await inventryModel.create({
              product: dbProduct._id,
              sku: dbProduct.sku,
              quantity: dbProduct.stock || 0,
              costPrice: dbProduct.price || 0,
              wholesalerPrice: dbProduct.price || 0,
            });
          }
        }

        // Atomic deduction: sirf tabhi minus hoga jab stock kaafi ho
        const result = await inventryModel.findOneAndUpdate(
          { product: productId, quantity: { $gte: qty } }, // Guard: stock >= qty
          { $inc: { quantity: -qty } },
          { new: true }
        );

        // Product.stock bhi sync karo
        await productModel.findByIdAndUpdate(productId, {
          $inc: { stock: -qty },
        });

        if (!result) {
          console.warn(
            `[INVENTORY WARNING] Stock insufficient or inventory missing for product: ${productId}. Qty requested: ${qty}`
          );
        } else {
          console.log(
            `[INVENTORY] Deducted ${qty} units from product: ${productId}. Remaining: ${result.quantity}`
          );
        }
      });

      // Sabhi deductions parallel mein run karo
      await Promise.allSettled(deductionPromises);
    }

    // 4. MLM Points & Commission Propagation Engine
    const purchasingAgent = await userModel.findById(userId);

    if (purchasingAgent) {
      let currentChildId = purchasingAgent._id;
      let currentParentId = purchasingAgent.parentAgentId;
      let childPosition = purchasingAgent.position; // "left" or "right"

      // ----------------------------------------------------------------
      // RULE 2: Upward Propagation with Correct Inc Operations
      // ----------------------------------------------------------------
      while (currentParentId) {
        const parentUser = await userModel.findById(currentParentId);
        if (!parentUser) break;

        const updateIncFields = {};

        if (childPosition === "left") {
          updateIncFields.leftBV = generatedBV;
          updateIncFields.totalLeftBV = generatedBV;
        } else if (childPosition === "right") {
          updateIncFields.rightBV = generatedBV;
          updateIncFields.totalRightBV = generatedBV;
        }

        if (Object.keys(updateIncFields).length > 0) {
          await userModel.findByIdAndUpdate(currentParentId, {
            $inc: updateIncFields,
          });

          // ------------------------------------------------------------
          // RULE 3: Process Binary Pair Matching on updated parent
          // ------------------------------------------------------------
          await processBinaryPairMatching(currentParentId);
        }

        // Advance to Next Level up in Binary Tree
        currentChildId = parentUser._id;
        currentParentId = parentUser.parentAgentId;
        childPosition = parentUser.position;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified & MLM points/commissions updated successfully",
      dbOrderId: updatedOrder._id,
      receiptData: {
        receiptNumber: updatedOrder.receiptNumber,
        dbOrderId: updatedOrder._id,
        transactionId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        amount: updatedOrder.totalAmount,
        earnedPV: generatedBV,
        paidAt: updatedOrder.paidAt,
        paymentStatus: updatedOrder.paymentStatus,
        items: updatedOrder.items,
      },
    });

  } catch (error) {
    console.error("❌ Error in verifyAndDistributeMLM:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Fetch order receipt details by DB order ID
 * @route   GET /api/payment/order/:orderId
 */
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderModel
      .findById(orderId)
      .populate("items.product", "name price category images brand")
      .populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      order: {
        _id: order._id,
        receiptNumber: order.receiptNumber,
        totalAmount: order.totalAmount,
        earnedPV: order.earnedPV,
        paymentStatus: order.paymentStatus,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        paymentResult: order.paymentResult,
        items: order.items,
        user: order.user,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching order details:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};