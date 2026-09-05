import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFranchise } from "../hooks/useFranchise";
import { useFranchiseSupply } from "../hooks/useFranchiseSupply";
import { getSupplyProducts } from "../service/franchise.api";

const FranchiseSupply = () => {
  const { currentFranchise } = useFranchise();

  // Custom hook destructuring
  const {
    requests = [],
    myRequests = [],
    filteredRequests = [],
    filters,
    loading,
    creatingLoading,
    actionLoading,
    error,
    successMessage,
    fetchSupplyRequests,
    createNewSupplyRequest,
    confirmReceived,
    fulfillRequest,
    selectedRequest,
    setSelectedRequest,
    setFilters,
  } = useFranchiseSupply();

  // Active Tab: 'my_requests' | 'incoming_requests'
  const [activeTab, setActiveTab] = useState("my_requests");

  // Modal & Available Products State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);

  useEffect(() => {
    fetchSupplyRequests();
  }, [fetchSupplyRequests]);

  // Load available products for Create Supply Request modal
  const handleOpenCreateModal = async () => {
    setIsModalOpen(true);
    if (availableProducts.length === 0) {
      setLoadingProducts(true);
      try {
        const res = await getSupplyProducts();
        const productData = res?.products || res?.data || (Array.isArray(res) ? res : []);
        setAvailableProducts(productData);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
  };

  // Handle adding line items in request modal
  const handleAddItem = () => {
    setItems((prev) => [...prev, { productId: "", quantity: 1 }]);
  };

  // Handle removing line items
  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle line item field changes
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === "quantity" ? Math.max(1, Number(value)) : value;
    setItems(updated);
  };

  // Submit New Supply Request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) return;

    try {
      await createNewSupplyRequest({ items: validItems });
      setIsModalOpen(false);
      setItems([{ productId: "", quantity: 1 }]);
    } catch (err) {
      console.error("Failed to submit supply request:", err);
    }
  };

  // Handle Franchise confirming they received the dispatched supply
  const handleConfirmReceived = async (requestId) => {
    try {
      await confirmReceived(requestId);
    } catch (err) {
      console.error("Error confirming supply received:", err);
    }
  };

  // Status mapping for visual styling & Badges
  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    switch (s) {
      case "RECEIVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-300 font-medium";
      case "DISPATCHED":
        return "bg-blue-50 text-blue-700 border-blue-300 font-medium";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-300 font-medium";
      case "PROCESS":
      case "PENDING":
      default:
        return "bg-amber-50 text-amber-700 border-amber-300 font-medium";
    }
  };

  const getStatusLabel = (status) => {
    const s = status?.toUpperCase();
    switch (s) {
      case "RECEIVED":
        return "Successfully Received";
      case "DISPATCHED":
        return "Dispatched (In Transit)";
      case "CANCELLED":
        return "Cancelled";
      case "PROCESS":
      case "PENDING":
      default:
        return "Process (Pending)";
    }
  };

  // Filter requests based on tab & filters
  const currentUserId = currentFranchise?._id || currentFranchise?.id;

  const mySupplyList = requests.filter((req) => {
    const reqUserId = req.requesterFranchise?._id || req.requesterFranchise;
    return String(reqUserId) === String(currentUserId);
  });

  const incomingSupplyList = requests.filter((req) => {
    const reqUserId = req.requesterFranchise?._id || req.requesterFranchise;
    return String(reqUserId) !== String(currentUserId);
  });

  const displayList = (activeTab === "my_requests" ? mySupplyList : incomingSupplyList).filter((req) => {
    const matchesSearch =
      !filters.search ||
      req.requestNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
      req.requesterLocation?.district?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus =
      filters.status === "ALL" ||
      req.status?.toUpperCase() === filters.status.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-light text-[#3B2820] p-4 md:p-8">
      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto space-y-6">
        {/* Back to Dashboard Navigation Button */}
        <div>
          <Link
            to="/franchise/dashboard"
            className="inline-flex items-center gap-2 text-xs font-normal text-[#8C6247] hover:text-[#C68A53] bg-white border border-[#EADBCE] px-3.5 py-2 rounded-xl shadow-xs transition hover:bg-[#FDF9F3]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header Title Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-[#EADBCE] shadow-xs gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-light text-[#3B2820]">
                Franchise Supply & Stock Management
              </h1>
              <span className="px-2.5 py-0.5 bg-[#FDF9F3] border border-[#EADBCE] text-[10px] uppercase font-medium text-[#8C6247] rounded-md">
                {currentFranchise?.franchiseType || "Franchise"} Tier
              </span>
            </div>
            <p className="text-xs text-[#8C6247] font-light mt-1">
              Create product supply requests, track dispatch status, and confirm stock receipts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSupplyRequests}
              className="px-4 py-2 bg-[#FDF9F3] text-[#8C6247] border border-[#D9C4B1] rounded-lg text-xs hover:bg-[#F8EFE4] transition-all"
            >
              Refresh Data
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-[#C68A53] text-white rounded-lg text-xs hover:bg-[#8C6247] transition-all shadow-xs font-normal"
            >
              + Create Supply Request
            </button>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="p-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl font-normal">
            ✓ {successMessage}
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-[#EADBCE] gap-6">
          <button
            onClick={() => setActiveTab("my_requests")}
            className={`pb-3 text-xs font-normal transition-all relative ${
              activeTab === "my_requests"
                ? "text-[#C68A53] font-medium border-b-2 border-[#C68A53]"
                : "text-[#8C6247] hover:text-[#3B2820]"
            }`}
          >
            My Supply Requests ({mySupplyList.length})
          </button>
          {incomingSupplyList.length > 0 && (
            <button
              onClick={() => setActiveTab("incoming_requests")}
              className={`pb-3 text-xs font-normal transition-all relative ${
                activeTab === "incoming_requests"
                  ? "text-[#C68A53] font-medium border-b-2 border-[#C68A53]"
                  : "text-[#8C6247] hover:text-[#3B2820]"
              }`}
            >
              Subordinate Incoming Requests ({incomingSupplyList.length})
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-5 rounded-xl border border-[#EADBCE] shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search request ID or location..."
              value={filters.search || ""}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full bg-[#FFFDF9] border border-[#EADBCE] text-[#3B2820] placeholder-[#8C6247]/60 text-xs rounded-lg px-3.5 py-2.5 outline-none focus:border-[#C68A53] transition-colors"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap bg-[#FDF9F3] p-1 rounded-lg border border-[#EADBCE] text-xs">
            {[
              { key: "ALL", label: "ALL" },
              { key: "Process", label: "Process (Pending)" },
              { key: "Dispatched", label: "Dispatched" },
              { key: "Received", label: "Successfully Received" },
              { key: "Cancelled", label: "Cancelled" },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setFilters({ status: st.key })}
                className={`px-3 py-1.5 rounded-md transition-all text-[11px] ${
                  filters.status === st.key
                    ? "bg-white text-[#3B2820] shadow-xs font-medium"
                    : "text-[#8C6247] hover:text-[#3B2820]"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Supply Requests Table */}
        <div className="bg-white rounded-xl border border-[#EADBCE] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#8C6247] font-light">
              Loading supply requests...
            </div>
          ) : displayList.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#8C6247] font-light">
              No supply requests found for the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FDF9F3] border-b border-[#EADBCE] text-[11px] uppercase tracking-wider text-[#8C6247] font-normal">
                    <th className="p-4">Request #</th>
                    <th className="p-4">Requester</th>
                    <th className="p-4">Tier</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2E7DC] text-xs">
                  {displayList.map((req) => {
                    const statusStr = req.status || "Process";
                    const isDispatched = statusStr?.toUpperCase() === "DISPATCHED";
                    const isReceived = statusStr?.toUpperCase() === "RECEIVED";

                    return (
                      <tr
                        key={req._id || req.id}
                        className="hover:bg-[#FFFDF9] transition-colors"
                      >
                        <td className="p-4 font-mono text-[11px] text-[#3B2820] font-medium">
                          #{req.requestNumber}
                        </td>
                        <td className="p-4 font-normal text-[#3B2820]">
                          {req.requesterFranchise?.fullName || "Self"}
                        </td>
                        <td className="p-4 text-[#8C6247]">
                          <span className="px-2 py-0.5 bg-[#FDF9F3] border border-[#EADBCE] rounded text-[10px] uppercase font-medium">
                            {req.requesterType || "Franchise"}
                          </span>
                        </td>
                        <td className="p-4 text-[#8C6247]">
                          {req.requesterLocation?.district
                            ? `${req.requesterLocation.district}, ${req.requesterLocation.state || ""}`
                            : "Local Outlet"}
                        </td>
                        <td className="p-4 text-[#3B2820] font-normal">
                          {req.items?.length || 0} Items
                        </td>
                        <td className="p-4 font-medium text-[#3B2820]">
                          ₹{req.totalAmount ? req.totalAmount.toLocaleString() : "0"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 text-[10px] rounded-full border uppercase tracking-wider ${getStatusBadge(
                              statusStr
                            )}`}
                          >
                            {getStatusLabel(statusStr)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* IF Dispatched & Active Tab is My Requests -> Show Confirm Received */}
                            {activeTab === "my_requests" && isDispatched && (
                              <button
                                onClick={() => handleConfirmReceived(req._id)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-normal transition shadow-xs disabled:opacity-50 flex items-center gap-1"
                              >
                                <span>✓ Confirm Received</span>
                              </button>
                            )}

                            {/* View Details */}
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="px-3 py-1.5 border border-[#D9C4B1] text-[#8C6247] rounded-lg text-xs hover:bg-[#FDF9F3] transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* New Supply Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3B2820]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EADBCE] rounded-xl max-w-lg w-full p-6 space-y-5 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#F2E7DC] pb-3">
              <div>
                <h3 className="text-lg font-light text-[#3B2820]">
                  Create Supply Request
                </h3>
                <p className="text-xs text-[#8C6247]">
                  Select products from catalog to request stock replenishment.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8C6247] hover:text-[#3B2820] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="space-y-3">
                <label className="text-xs text-[#8C6247] font-normal block">
                  Select Products & Quantities
                </label>

                {loadingProducts ? (
                  <div className="p-4 text-center text-xs text-[#8C6247]">
                    Loading products catalog...
                  </div>
                ) : (
                  items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        required
                        value={item.productId}
                        onChange={(e) =>
                          handleItemChange(index, "productId", e.target.value)
                        }
                        className="flex-1 bg-[#FFFDF9] border border-[#EADBCE] text-[#3B2820] text-xs rounded-lg p-2.5 outline-none focus:border-[#C68A53] font-normal"
                      >
                        <option value="">-- Select Product --</option>
                        {availableProducts.map((prod) => (
                          <option key={prod._id} value={prod._id}>
                            {prod.name} — ₹{prod.price?.toLocaleString()}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        className="w-20 bg-[#FFFDF9] border border-[#EADBCE] text-[#3B2820] text-xs rounded-lg p-2.5 outline-none focus:border-[#C68A53]"
                      />

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-rose-600 hover:text-rose-800 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-[#C68A53] font-normal hover:underline"
              >
                + Add Another Product
              </button>

              <div className="flex gap-3 justify-end pt-4 border-t border-[#F2E7DC]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#D9C4B1] text-[#8C6247] text-xs rounded-lg hover:bg-[#FDF9F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingLoading}
                  className="px-4 py-2 bg-[#C68A53] text-white text-xs rounded-lg hover:bg-[#8C6247] disabled:opacity-50 transition-colors font-normal"
                >
                  {creatingLoading ? "Submitting..." : "Submit Supply Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-[#3B2820]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EADBCE] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-lg">
            <div className="flex justify-between items-center border-b border-[#F2E7DC] pb-3">
              <div>
                <h3 className="text-base font-light text-[#3B2820]">
                  Request #{selectedRequest.requestNumber}
                </h3>
                <p className="text-[11px] text-[#8C6247]">
                  Status:{" "}
                  <span className="font-semibold uppercase text-[#3B2820]">
                    {getStatusLabel(selectedRequest.status)}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-[#8C6247] hover:text-[#3B2820] text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs text-[#8C6247]">
                <span>Total Amount:</span>
                <span className="font-medium text-[#3B2820]">
                  ₹{selectedRequest.totalAmount ? selectedRequest.totalAmount.toLocaleString() : "0"}
                </span>
              </div>

              <h4 className="text-xs font-normal text-[#3B2820]">
                Items Breakdown:
              </h4>

              <div className="divide-y divide-[#F2E7DC] bg-[#FFFDF9] border border-[#EADBCE] rounded-lg p-3 max-h-56 overflow-y-auto">
                {selectedRequest.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-2.5 flex justify-between items-center text-xs text-[#3B2820]"
                  >
                    <div>
                      <p className="font-normal">
                        {item.productId?.name || `Product ID: ${item.productId}`}
                      </p>
                      {item.unitPrice && (
                        <p className="text-[10px] text-[#8C6247]">
                          ₹{item.unitPrice} / unit
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[#8C6247] font-normal">
                        Qty: {item.quantity}
                      </p>
                      {item.subtotal && (
                        <p className="font-medium text-[#3B2820]">
                          ₹{item.subtotal.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedRequest.dispatchNotes && (
                <div className="p-3 bg-[#FDF9F3] border border-[#EADBCE] rounded-lg text-xs text-[#8C6247]">
                  <span className="font-medium text-[#3B2820]">Dispatch Notes: </span>
                  {selectedRequest.dispatchNotes}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#F2E7DC]">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-[#FDF9F3] border border-[#D9C4B1] text-[#8C6247] text-xs rounded-lg hover:bg-[#F8EFE4]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FranchiseSupply;