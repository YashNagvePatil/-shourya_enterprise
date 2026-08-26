// Manages network-wide stock supply requests and fulfillment dispatches
export const getGlobalSupplyRequests = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== "ALL") filter.status = status;

    const requests = await SupplyRequest.find(filter)
      .populate("franchiseId", "fullName email franchiseType address")
      .populate("items.productId", "name sku price")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSupplyDispatchStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, trackingNumber, notes } = req.body; // 'APPROVED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED'

    const supplyReq = await SupplyRequest.findById(requestId);
    if (!supplyReq) return res.status(404).json({ success: false, message: "Request not found" });

    supplyReq.status = status;
    if (trackingNumber) supplyReq.trackingNumber = trackingNumber;
    if (notes) supplyReq.adminNotes = notes;

    await supplyReq.save();
    return res.status(200).json({ success: true, message: "Supply request updated", supplyReq });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};