// Handles onboarding reviews, KYC verification, status overrides, and hierarchy retrieval
export const getPendingApplications = async (req, res) => {
  try {
    const { tier, page = 1, limit = 10 } = req.query;
    const query = { status: "PENDING" };
    if (tier) query.franchiseType = tier;

    const applications = await Franchise.find(query)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Franchise.countDocuments(query);

    return res.status(200).json({ success: true, applications, total, page });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewApplication = async (req, res) => {
  try {
    const { franchiseId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'APPROVE' | 'REJECT'

    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) return res.status(404).json({ success: false, message: "Franchise not found" });

    if (action === "APPROVE") {
      franchise.status = "ACTIVE";
      franchise.verifiedAt = new Date();
      franchise.rejectionReason = null;
    } else if (action === "REJECT") {
      franchise.status = "REJECTED";
      franchise.rejectionReason = rejectionReason || "KYC verification failed";
    }

    await franchise.save();
    return res.status(200).json({ success: true, message: `Application ${action.toLowerCase()}d successfully`, franchise });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFranchiseHierarchy = async (req, res) => {
  try {
    const hierarchy = await Franchise.find({ status: "ACTIVE" })
      .select("fullName email franchiseType address status wallet createdAt")
      .sort({ "address.state": 1, "address.district": 1 });

    return res.status(200).json({ success: true, count: hierarchy.length, hierarchy });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFranchiseStatus = async (req, res) => {
  try {
    const { franchiseId } = req.params;
    const { status } = req.body; // 'ACTIVE' | 'SUSPENDED' | 'BLOCKED'

    const updated = await Franchise.findByIdAndUpdate(
      franchiseId,
      { status },
      { new: true }
    ).select("-password");

    return res.status(200).json({ success: true, message: `Status updated to ${status}`, franchise: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};