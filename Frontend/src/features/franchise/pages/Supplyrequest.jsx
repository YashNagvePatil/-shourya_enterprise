import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useFranchise } from "../hooks/useFranchise";
import { useFranchiseSupply } from "../hooks/useFranchiseSupply";

const FranchiseSupply = () => {
  const { currentFranchise } = useFranchise();
  const location = useLocation();

  // Custom hook destructuring
  const {
    filteredRequests,
    filters,
    loading,
    creatingLoading,
    error,
    fetchSupplyRequests,
    createNewSupplyRequest,
    selectedRequest,
    setSelectedRequest,
    setFilters,
  } = useFranchiseSupply();

  // Modal State for New Supply Request
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);

  useEffect(() => {
    fetchSupplyRequests();
  }, [fetchSupplyRequests]);

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

  // Submit Request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      await createNewSupplyRequest({ items });
      setIsModalOpen(false);
      setItems([{ productId: "", quantity: 1 }]);
    } catch (err) {
      console.error("Failed to submit supply request:", err);
    }
  };

  // Status mapping for visual styling & Badges
  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "FULFILLED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "PENDING":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  // Sidebar Navigation Links
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      id: "dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Inventory",
      path: "/franchise/inventory",
      id: "inventory",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      name: "Supply",
      path: "/franchise/supply",
      id: "supply",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      name: "Finance",
      path: "/franchise/finance",
      id: "finance",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#FFFDF9] font-light text-[#3B2820]">
      {/* Fixed Left Sidebar */}
      <aside className="w-64 bg-white border-r border-[#D9C4B1]/50 fixed h-full flex flex-col justify-between z-20">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#F2E7DC]">
            <h2 className="text-lg font-normal tracking-wide text-[#3B2820] uppercase">
              Apex Franchise
            </h2>
            <p className="text-xs text-[#C68A53] mt-0.5 uppercase tracking-wider font-normal">
              {currentFranchise?.franchiseType || "DISTRICT"} PORTAL
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm transition-all ${
                    isActive
                      ? "bg-[#C68A53] text-white font-normal shadow-sm shadow-[#C68A53]/30"
                      : "text-[#8C6247] hover:bg-[#FDF9F3] hover:text-[#3B2820]"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card */}
        <div className="p-4 m-4 bg-[#FDF9F3] rounded-xl border border-[#EADBCE] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#EADBCE] text-[#8C6247] flex items-center justify-center font-normal text-sm border border-[#D9C4B1]">
            {currentFranchise?.fullName?.charAt(0) || "F"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-normal text-[#3B2820] truncate">
              {currentFranchise?.fullName || "Franchise Partner"}
            </p>
            <p className="text-[10px] text-[#8C6247] truncate">
              {currentFranchise?.email || "partner@apex.com"}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 space-y-6">
        {/* Header Title Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-[#EADBCE] shadow-sm gap-4">
          <div>
            <h1 className="text-xl font-light text-[#3B2820]">
              Supply Management
            </h1>
            <p className="text-xs text-[#8C6247] font-light mt-0.5">
              Request stock replenishment across hierarchical franchise tiers and track fulfillments.
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
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#C68A53] text-white rounded-lg text-xs hover:bg-[#8C6247] transition-all shadow-sm"
            >
              + Create Supply Request
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white p-5 rounded-xl border border-[#EADBCE] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search request ID or district..."
              value={filters.search || ""}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full bg-[#FFFDF9] border border-[#EADBCE] text-[#3B2820] placeholder-[#8C6247]/60 text-xs rounded-lg px-3.5 py-2.5 outline-none focus:border-[#C68A53] transition-colors"
            />
          </div>

          {/* Status Filter Tabs (SYNCED WITH BACKEND STATES) */}
          <div className="flex flex-wrap bg-[#FDF9F3] p-1 rounded-lg border border-[#EADBCE] text-xs">
            {["ALL", "PENDING", "FULFILLED", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilters({ status })}
                className={`px-3.5 py-1.5 rounded-md transition-all uppercase text-[11px] ${
                  filters.status === status
                    ? "bg-white text-[#3B2820] shadow-sm font-normal"
                    : "text-[#8C6247] hover:text-[#3B2820]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Supply Requests Table */}
        <div className="bg-white rounded-xl border border-[#EADBCE] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#8C6247] font-light">
              Loading supply requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#8C6247] font-light">
              No supply requests found.
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
                  {filteredRequests.map((req) => (
                    <tr
                      key={req._id || req.id}
                      className="hover:bg-[#FFFDF9] transition-colors"
                    >
                      <td className="p-4 font-mono text-[11px] text-[#3B2820]">
                        {req.requestNumber}
                      </td>
                      <td className="p-4 font-normal text-[#3B2820]">
                        {req.requesterFranchise?.fullName || "Self"}
                      </td>
                      <td className="p-4 text-[#8C6247]">
                        <span className="px-2 py-0.5 bg-[#FDF9F3] border border-[#EADBCE] rounded text-[10px] uppercase">
                          {req.requesterType || "VILLAGE"}
                        </span>
                      </td>
                      <td className="p-4 text-[#8C6247]">
                        {req.requesterLocation?.district
                          ? `${req.requesterLocation.district}, ${req.requesterLocation.state || ""}`
                          : "Local"}
                      </td>
                      <td className="p-4 text-[#3B2820] font-normal">
                        {req.items?.length || 0} Line Items
                      </td>
                      <td className="p-4 font-normal text-[#3B2820]">
                        ₹{req.totalAmount ? req.totalAmount.toLocaleString() : "0"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] rounded-full border uppercase font-medium ${getStatusBadge(
                            req.status
                          )}`}
                        >
                          {req.status || "PENDING"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="px-3 py-1.5 border border-[#D9C4B1] text-[#8C6247] rounded-lg text-xs hover:bg-[#FDF9F3] transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
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
              <h3 className="text-lg font-light text-[#3B2820]">
                Create Supply Request
              </h3>
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
                  Requested Items (Product IDs & Quantities)
                </label>
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Product ID (e.g. 64b8f...)"
                      value={item.productId}
                      onChange={(e) =>
                        handleItemChange(index, "productId", e.target.value)
                      }
                      className="flex-1 bg-[#FFFDF9] border border-[#EADBCE] text-[#3B2820] text-xs rounded-lg p-2.5 outline-none focus:border-[#C68A53]"
                    />
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
                ))}
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
                  className="px-4 py-2 bg-[#C68A53] text-white text-xs rounded-lg hover:bg-[#8C6247] disabled:opacity-50 transition-colors"
                >
                  {creatingLoading ? "Submitting..." : "Submit Request"}
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
                  <span className="font-semibold uppercase">
                    {selectedRequest.status || "PENDING"}
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
                <span className="font-semibold text-[#3B2820]">
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