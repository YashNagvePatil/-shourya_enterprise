import orderModel from "../models/order.model.js";
import userModel from "../models/user.models.js";
import productModel from "../models/product.model.js"; 

export const verifyAndDistributeMLM = async (req, res) => {
  try {
    let { orderId } = req.body;
    const userId = req.user._id;

    let targetOrderId = orderId;

    // 1. Agar orderId ek Object hai (e.g., { productId: '...', quantity: 1 })
    if (typeof orderId === "object" && orderId !== null) {
      const productId = orderId.productId || orderId._id;
      
      if (!productId) {
        return res.status(400).json({ success: false, message: "Invalid product data provided" });
      }

      // Step A: Instant Order Create karein Database me
      const newOrder = await orderModel.create({
        user: userId,
        products: [{ product: productId, quantity: orderId.quantity || 1 }],
        totalBV: 100, // Aap actual Product Schema se fetch karke set kar sakte hain
        totalPV: 10,
        isPaid: false
      });

      targetOrderId = newOrder._id.toString();
    }

    // 2. Fetch Order from DB
    const existingOrder = await orderModel.findById(targetOrderId);
    if (!existingOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (existingOrder.isPaid) {
      return res.status(400).json({ success: false, message: "Order is already paid" });
    }

    const totalBV = existingOrder.totalBV || 0;
    const totalPV = existingOrder.totalPV || 0;

    // 3. Mark Order as Paid
    const updatedOrder = await orderModel.findByIdAndUpdate(
      targetOrderId,
      {
        isPaid: true,
        paidAt: Date.now(),
        paymentResult: { id: `pay_dummy_${Date.now()}`, status: "SUCCESS" }
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
      message: "Payment processed successfully",
      orderId: updatedOrder._id,
      totalUplinesRewarded: level - 1,
    });

  } catch (error) {
    console.error("❌ Error in verifyAndDistributeMLM:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCommissionPercentage = (level) => {
  const levelCommissions = { 1: 10, 2: 5, 3: 3, 4: 2, 5: 1 };
  return levelCommissions[level] || 0.5;
};