// Controls payouts, commissions, rent liabilities, and ROI allocations
export const getFinancialSummary = async (req, res) => {
  try {
    const payouts = await FinancialPayout.aggregate([
      {
        $group: {
          _id: "$type", // 'RENT' | 'ROI' | 'COMMISSION'
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const pendingWithdrawals = await WithdrawalRequest.find({ status: "PENDING" })
      .populate("franchiseId", "fullName email bankDetails");

    return res.status(200).json({ success: true, payouts, pendingWithdrawals });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const processSettlement = async (req, res) => {
  try {
    const { franchiseId, amount, payoutType, referenceNo } = req.body;

    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) return res.status(404).json({ success: false, message: "Franchise not found" });

    const payout = await FinancialPayout.create({
      franchiseId,
      amount,
      type: payoutType,
      referenceNo,
      status: "COMPLETED",
      processedAt: new Date()
    });

    franchise.wallet.balance += amount;
    await franchise.save();

    return res.status(200).json({ success: true, message: "Settlement processed", payout });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};