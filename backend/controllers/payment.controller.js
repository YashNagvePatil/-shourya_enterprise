import Razorpay from "razorpay";
import crypto from "crypto";
import orderModel from "../models/order.model.js";
import userModel from "../models/user.models.js";
import productModel from "../models/product.model.js";
import inventryModel from "../models/inventry.model.js";
import cartModel from "../models/cart.model.js";
import { config } from "../config/config.js";

// Initialize Razorpay Instance (Supports both Test and Live Keys)
const razorpayKeyId =
  process.env.RAZORPAY_KEY_ID ||
  process.env.RAZORPAY_LIVE_API_KEY ||
  config.RAZORPAY_TEST_API_KEY ||
  process.env.RAZORPAY_TEST_API_KEY;

const razorpayKeySecret =
  process.env.RAZORPAY_KEY_SECRET ||
  config.RAZORPAY_KEY_SECRET;

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

/**
 * 🎯 Shourya Enterprise Point Calculation Rule:
 * Order Amount < ₹13,000  => 500 Points (BV/PV)
 * Order Amount >= ₹13,000 => 1000 Points (BV/PV)
 */
export const calculateShouryaPoints = (totalAmount) => {
  return Number(totalAmount) >= 13000 ? 1000 : 500;
};

/**
 * @desc    Step 1: Create Razorpay Order (Secure Server-side pricing & stock verification)
 * @route   POST /api/payment/create-order
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { productId, quantity = 1, items: reqItems } = req.body;
    const userId = req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized! User session missing." });
    }

    let orderItems = [];
    let calculatedTotalAmount = 0;

    // ─────────────────────────────────────────────────────────────────
    // Case A: Single Product Direct Purchase / Buy Now
    // ─────────────────────────────────────────────────────────────────
    if (productId) {
      const product = await productModel.findById(productId);
      if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: "Product is not available or inactive." });
      }

      const qty = Math.max(1, parseInt(quantity, 10) || 1);
      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock! Only ${product.stock} units available for ${product.name}.`,
        });
      }

      const itemTotal = (product.price || 0) * qty;
      calculatedTotalAmount = itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: qty,
        pv: 0, // Points will be attached based on overall order slab
      });
    }
    // ─────────────────────────────────────────────────────────────────
    // Case B: Multiple items array passed directly in payload
    // ─────────────────────────────────────────────────────────────────
    else if (Array.isArray(reqItems) && reqItems.length > 0) {
      for (const item of reqItems) {
        const pId = item.productId || item.product;
        const pQty = Math.max(1, parseInt(item.quantity || item.qty || 1, 10));
        const dbProd = await productModel.findById(pId);

        if (!dbProd || !dbProd.isActive) {
          return res.status(404).json({
            success: false,
            message: `One of the selected products is inactive or not found.`,
          });
        }

        if (dbProd.stock < pQty) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${dbProd.name}. Available: ${dbProd.stock}, Requested: ${pQty}`,
          });
        }

        calculatedTotalAmount += (dbProd.price || 0) * pQty;
        orderItems.push({
          product: dbProd._id,
          name: dbProd.name,
          price: dbProd.price,
          quantity: pQty,
          pv: 0,
        });
      }
    }
    // ─────────────────────────────────────────────────────────────────
    // Case C: Standard Cart Checkout: Fetch active items from User Cart DB
    // ─────────────────────────────────────────────────────────────────
    else {
      const userCart = await cartModel.findOne({ user: userId }).populate("items.product");
      if (!userCart || !userCart.items || userCart.items.length === 0) {
        return res.status(400).json({ success: false, message: "Your shopping cart is empty." });
      }

      for (const cartItem of userCart.items) {
        const p = cartItem.product;
        if (!p || !p.isActive) {
          return res.status(400).json({
            success: false,
            message: "One of the items in your cart is currently unavailable.",
          });
        }

        const qty = Math.max(1, parseInt(cartItem.quantity, 10) || 1);
        if (p.stock < qty) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${p.name}. Only ${p.stock} units left.`,
          });
        }

        calculatedTotalAmount += (p.price || 0) * qty;
        orderItems.push({
          product: p._id,
          name: p.name,
          price: p.price,
          quantity: qty,
          pv: 0,
        });
      }
    }

    if (calculatedTotalAmount <= 0) {
      return res.status(400).json({ success: false, message: "Total order amount must be greater than zero." });
    }

    // ─────────────────────────────────────────────────────────────────
    // 🎯 SHOURYA POINT SYSTEM:
    // < 13000 => 500 Points, >= 13000 => 1000 Points
    // ─────────────────────────────────────────────────────────────────
    const earnedPoints = calculateShouryaPoints(calculatedTotalAmount);

    // Attach earned points to order items
    orderItems.forEach((item) => {
      item.pv = earnedPoints;
    });

    // 1. Create Order in Razorpay (Amount in Paise: ₹1 = 100 paise)
    const receiptNumber = `REC_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const razorpayOptions = {
      amount: Math.round(calculatedTotalAmount * 100),
      currency: "INR",
      receipt: receiptNumber,
      notes: {
        userId: userId.toString(),
      },
    };

    const razorpayOrder = await razorpay.orders.create(razorpayOptions);

    // 2. Save Order in MongoDB with bound razorpayOrderId & status PENDING
    const newOrder = await orderModel.create({
      user: userId,
      items: orderItems,
      totalAmount: calculatedTotalAmount, // Server-calculated price
      earnedPV: earnedPoints,             // Exact 500 or 1000 points
      receiptNumber: receiptNumber,
      razorpayOrderId: razorpayOrder.id,  // Direct permanent binding
      paymentStatus: "PENDING",
      isPaid: false,
      paymentMethod: "RAZORPAY",
      deliveryStatus: "PENDING_ASSIGNMENT",
    });

    return res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: newOrder._id,
      keyId: razorpayKeyId,
    });
  } catch (error) {
    console.error("❌ Error creating Razorpay Order:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Helper: Atomic Binary Pair Matching Algorithm
 * Safe against race conditions and concurrent double-credit.
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
    const matchingPayout = matchedPairsAmount; // 1:1 payout ratio (1 Point = ₹1)

    // Atomic update with conditional guard ($gte) to prevent race conditions
    await userModel.findOneAndUpdate(
      {
        _id: userId,
        leftBV: { $gte: matchedPairsAmount },
        rightBV: { $gte: matchedPairsAmount },
      },
      {
        $inc: {
          leftBV: -matchedPairsAmount,
          rightBV: -matchedPairsAmount,
          walletBalance: matchingPayout,
          totalMatchingBonus: matchingPayout,
          totalEarning: matchingPayout,
        },
      }
    );
  }
};

/**
 * Helper: Upward MLM Point Propagation Engine
 * Includes loop detection & maximum tree depth guard.
 */
const propagateMLMPoints = async (userId, generatedBV) => {
  const purchasingAgent = await userModel.findById(userId);
  if (!purchasingAgent) return;

  let currentParentId = purchasingAgent.parentAgentId;
  let childPosition = purchasingAgent.position; // "left" or "right"
  const visitedParents = new Set();
  const MAX_DEPTH = 100;
  let depth = 0;

  while (currentParentId && depth < MAX_DEPTH) {
    if (visitedParents.has(currentParentId.toString())) {
      console.warn(`⚠️ [MLM LOOP DETECTED] Circular hierarchy detected at agent: ${currentParentId}`);
      break;
    }
    visitedParents.add(currentParentId.toString());
    depth++;

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

      // Run Binary Pair Matching on updated parent
      await processBinaryPairMatching(currentParentId);
    }

    // Advance to Next Level up in Binary Tree
    currentParentId = parentUser.parentAgentId;
    childPosition = parentUser.position;
  }
};

/**
 * Core Reusable Fulfillment Engine (Used by both Client Verification and Webhooks)
 * Ensures 100% Idempotency (no duplicate commissions or duplicate stock deductions).
 */
export const executeOrderFulfillment = async ({
  orderId,
  razorpayPaymentId,
  razorpayOrderId,
  userId,
}) => {
  const existingOrder = await orderModel.findById(orderId).populate("items.product", "name price category");
  if (!existingOrder) {
    throw new Error("Order not found");
  }

  // 🛡️ IDEMPOTENCY GUARD: If order is already PAID, skip fulfillment safely
  if (existingOrder.paymentStatus === "PAID" || existingOrder.isPaid) {
    return { alreadyProcessed: true, order: existingOrder };
  }

  // 🎯 Calculate Points based on strict Shourya rule:
  // < 13000 => 500 Points, >= 13000 => 1000 Points
  const totalAmount = existingOrder.totalAmount || 0;
  const generatedBV = calculateShouryaPoints(totalAmount);

  // Snapshot agent delivery address
  const agentForAddress = await userModel.findById(userId || existingOrder.user).select("address").lean();

  // 1. Mark Order as PAID
  existingOrder.isPaid = true;
  existingOrder.paymentStatus = "PAID";
  existingOrder.earnedPV = generatedBV;
  existingOrder.paidAt = new Date();
  existingOrder.razorpayOrderId = razorpayOrderId;
  existingOrder.razorpayPaymentId = razorpayPaymentId;
  existingOrder.paymentResult = {
    id: razorpayPaymentId,
    razorpayOrderId: razorpayOrderId,
    status: "SUCCESS",
  };
  existingOrder.deliveryStatus = "PENDING_ASSIGNMENT";
  if (agentForAddress?.address) {
    existingOrder.deliveryAddress = agentForAddress.address;
  }

  existingOrder.statusHistory.push({
    status: "PENDING_ASSIGNMENT",
    changedBy: "agent",
    changedById: userId || existingOrder.user,
    note: "Payment verified successfully — awaiting franchise assignment",
    timestamp: new Date(),
  });

  await existingOrder.save();

  // 2. Clear user cart
  await cartModel.findOneAndUpdate(
    { user: existingOrder.user },
    { $set: { items: [], totalAmount: 0, totalPV: 0 } }
  );

  // 3. Atomic Inventory & Product Stock Deduction
  if (existingOrder.items && existingOrder.items.length > 0) {
    for (const item of existingOrder.items) {
      const productId = item.product?._id || item.product;
      const qty = item.quantity || 1;

      // Sync product.stock
      await productModel.findByIdAndUpdate(productId, {
        $inc: { stock: -qty },
      });

      // Sync inventryModel
      let existingInventory = await inventryModel.findOne({ product: productId });
      if (!existingInventory) {
        const dbProduct = await productModel.findById(productId);
        if (dbProduct) {
          existingInventory = await inventryModel.create({
            product: dbProduct._id,
            sku: dbProduct.sku || `SKU-${dbProduct._id}`,
            quantity: dbProduct.stock || 0,
            costPrice: dbProduct.price || 0,
            wholesalerPrice: dbProduct.price || 0,
          });
        }
      }

      await inventryModel.findOneAndUpdate(
        { product: productId },
        { $inc: { quantity: -qty } }
      );
    }
  }

  // 4. Distribute MLM Points & Run Binary Matching Upward
  await propagateMLMPoints(existingOrder.user, generatedBV);

  return { alreadyProcessed: false, order: existingOrder };
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

    const userId = req.user._id || req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !dbOrderId) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification parameters.",
      });
    }

    // 1. Signature Verification Check
    const generatedSignature = crypto
      .createHmac("sha256", config.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed! Invalid signature.",
      });
    }

    // 2. Fetch Order from DB & Security Validation
    const existingOrder = await orderModel.findById(dbOrderId);
    if (!existingOrder) {
      return res.status(404).json({ success: false, message: "Order record not found." });
    }

    // 🔒 Security Guard 1: Verify order ownership
    if (existingOrder.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! This order does not belong to your account.",
      });
    }

    // 🔒 Security Guard 2: Verify Razorpay order binding
    if (existingOrder.razorpayOrderId && existingOrder.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Order ID mismatch with Razorpay transaction record.",
      });
    }

    // 3. Execute Order Fulfillment via Reusable Engine
    const { alreadyProcessed, order: updatedOrder } = await executeOrderFulfillment({
      orderId: dbOrderId,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      userId: userId,
    });

    return res.status(200).json({
      success: true,
      message: alreadyProcessed
        ? "Order was already processed successfully."
        : "Payment verified & MLM points/commissions updated successfully.",
      dbOrderId: updatedOrder._id,
      receiptData: {
        receiptNumber: updatedOrder.receiptNumber,
        dbOrderId: updatedOrder._id,
        transactionId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        amount: updatedOrder.totalAmount,
        earnedPV: updatedOrder.earnedPV,
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
 * @desc    Step 3: Razorpay Webhook Handler (Fail-Safe Server-to-Server Fallback)
 * @route   POST /api/payment/webhook
 */
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || config.RAZORPAY_KEY_SECRET;
    const webhookSignature = req.headers["x-razorpay-signature"];

    if (!webhookSignature) {
      return res.status(400).json({ success: false, message: "Missing webhook signature header." });
    }

    // Verify webhook signature with raw payload
    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== webhookSignature) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature." });
    }

    const { event, payload } = req.body;

    if (event === "order.paid" || event === "payment.captured") {
      const paymentEntity = payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      // Find matching order by razorpayOrderId
      const order = await orderModel.findOne({ razorpayOrderId: razorpayOrderId });
      if (order && order.paymentStatus !== "PAID") {
        await executeOrderFulfillment({
          orderId: order._id,
          razorpayPaymentId: razorpayPaymentId,
          razorpayOrderId: razorpayOrderId,
          userId: order.user,
        });
        console.log(`✅ [WEBHOOK SUCCESS] Order ${order._id} fulfilled via Razorpay webhook.`);
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("❌ Error processing Razorpay Webhook:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Step 4: Fetch order receipt details by DB order ID
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
