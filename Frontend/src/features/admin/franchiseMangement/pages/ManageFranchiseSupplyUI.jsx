import React, { useState, useEffect } from "react";
import useFranchiseSupply from "../hook/useFranchiseSupply"; // Path according to your setup

const ManageFranchiseSupplyUI = () => {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedReqForUpdate, setSelectedReqForUpdate] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({
    status: "FULFILLED",
    notes: "",
  });

  const {
    requests = [],
    count = 0,
    loading = { fetch: false, update: false },
    error,
    successMessage,
    fetchSupplyRequests,
    handleUpdateDispatchStatus,
    resetMessages,
  } = useFranchiseSupply();

  useEffect(() => {
    fetchSupplyRequests({ status: statusFilter });
  }, [statusFilter, fetchSupplyRequests]);

  const handleFilterChange = (filter) => {
    resetMessages();
    setStatusFilter(filter);
  };

  const openUpdateModal = (req) => {
    setSelectedReqForUpdate(req);
    setDispatchForm({
      status: req.status === "PENDING" ? "FULFILLED" : req.status,
      notes: req.adminNotes || "",
    });
  };

  const closeUpdateModal = () => {
    setSelectedReqForUpdate(null);
    setDispatchForm({ status: "FULFILLED", notes: "" });
  };

  const submitDispatchUpdate = async (e) => {
    e.preventDefault();
    if (!selectedReqForUpdate) return;

    try {
      await handleUpdateDispatchStatus(selectedReqForUpdate._id, dispatchForm);
      closeUpdateModal();
    } catch (err) {
      // Handled by Redux/Hook error state
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "FULFILLED":
      case "DELIVERED":
        return "bg-[#4A7C59]/15 text-[#2D5A3A] border-[#4A7C59]/30";
      case "CANCELLED":
        return "bg-[#D82348]/10 text-[#D82348] border-[#D82348]/30";
      case "PENDING":
      default:
        return "bg-[#E2C275]/20 text-[#8A6A1C] border-[#E2C275]/50";
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-10 font-sans font-light text-[#4A3E3D]">
      {/* Header Bar */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#F0E6D8] pb-5">
        <div>
          <h1 className="text-2xl font-light tracking-wide text-[#2C1E21] flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[#D82348]"></span>
            Supply Chain & Stock Fulfillment
          </h1>
          <p className="text-xs font-light text-[#9A827A] mt-1">
            Manage store stock fulfillment requests and passbook balance updates
          </p>
        </div>

        <button
          onClick={() => fetchSupplyRequests({ status: statusFilter })}
          disabled={loading.fetch}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2C275]/60 bg-white px-4 py-2 text-xs font-light tracking-wide text-[#9A1B32] shadow-sm transition hover:bg-[#F99834]/10 hover:border-[#F99834] active:bg-[#F99834]/20 disabled:opacity-50"
        >
          <svg
            className={`h-4 w-4 text-[#D82348] ${loading.fetch ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh Requests
        </button>
      </header>

      {/* Notifications */}
      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[#D82348]/30 bg-[#D82348]/5 p-4 text-xs font-light text-[#D82348]">
          <span>
            <strong className="font-normal">Error:</strong> {error}
          </span>
          <button onClick={resetMessages} className="text-[#9A1B32] underline">
            Dismiss
          </button>
        </div>
      )}
      {successMessage && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[#E2C275]/60 bg-[#FAF6EE] p-4 text-xs font-light text-[#2C1E21]">
          <span>{successMessage}</span>
          <button onClick={resetMessages} className="text-[#9A827A] underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Status Filter Tabs (Simplified States) */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-[#F0E6D8] pb-4">
        {["ALL", "PENDING", "FULFILLED", "CANCELLED"].map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            className={`rounded-xl px-4 py-1.5 text-xs font-light transition tracking-wide ${
              statusFilter === filter
                ? "bg-[#D82348] text-white shadow-sm"
                : "bg-white text-[#9A827A] border border-[#F0E6D8] hover:bg-[#FAF6EE] hover:text-[#2C1E21]"
            }`}
          >
            {filter} {statusFilter === filter ? `(${count})` : ""}
          </button>
        ))}
      </div>

      {/* Supply Request List */}
      <main className="rounded-2xl border border-[#F0E6D8] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-[#FAF6EE] pb-4">
          <h2 className="text-sm font-normal text-[#2C1E21]">
            Global Supply Orders ({count})
          </h2>
          <span className="text-xs font-light text-[#9A827A]">
            Showing filter: <strong className="font-normal text-[#2C1E21]">{statusFilter}</strong>
          </span>
        </div>

        {loading.fetch ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 w-full animate-pulse rounded-2xl bg-[#FAF6EE]" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-xs font-light text-[#9A827A]">
            No supply requests found matching status "{statusFilter}".
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              // Priority to saved supply order totalAmount, fallback to calculated sum
              const totalCost =
                req.totalAmount ||
                req.items?.reduce(
                  (sum, i) => sum + (i.productId?.price || 0) * (i.quantity || 1),
                  0
                );

              const isCompleted = ["FULFILLED", "DELIVERED", "CANCELLED"].includes(req.status);

              return (
                <div
                  key={req._id}
                  className="rounded-2xl border border-[#F0E6D8] bg-white p-5 shadow-sm transition hover:border-[#E2C275]/80 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Header Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-base font-normal text-[#2C1E21]">
                          {req.franchiseId?.fullName || "Unknown Outlet"}
                        </h3>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-light uppercase tracking-widest ${getStatusBadgeStyle(
                            req.status
                          )}`}
                        >
                          {req.status || "PENDING"}
                        </span>
                        <span className="rounded-md bg-[#FAF6EE] px-2 py-0.5 text-[10px] font-light text-[#9A827A]">
                          {req.franchiseId?.franchiseType || "Standard"} Tier
                        </span>
                      </div>
                      <p className="text-xs font-light text-[#9A827A]">
                        {req.franchiseId?.email} • {req.franchiseId?.mobile || "N/A"} •{" "}
                        {req.franchiseId?.address?.district || ""},{" "}
                        {req.franchiseId?.address?.state || ""}
                      </p>
                    </div>

                    {/* Cost & Action */}
                    <div className="flex items-center gap-4 justify-between lg:justify-end border-t border-[#FAF6EE] lg:border-t-0 pt-3 lg:pt-0">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] uppercase font-light tracking-widest text-[#9A827A] block">
                          Total Value
                        </span>
                        <span className="text-base font-light text-[#2C1E21]">
                          {formatCurrency(totalCost)}
                        </span>
                      </div>

                      <button
                        onClick={() => openUpdateModal(req)}
                        disabled={isCompleted}
                        className={`rounded-xl border px-4 py-2 text-xs font-light transition ${
                          isCompleted
                            ? "border-[#F0E6D8] bg-[#FAF8F7] text-[#9A827A] cursor-not-allowed opacity-60"
                            : "border-[#E2C275] bg-[#FAF6EE] text-[#9A1B32] hover:bg-[#F99834]/15 hover:border-[#F99834] active:bg-[#F99834]/25"
                        }`}
                      >
                        {isCompleted ? "Fulfilled / Closed" : "Update Status"}
                      </button>
                    </div>
                  </div>

                  {/* Item Breakdown */}
                  <div className="mt-4 border-t border-[#FAF6EE] pt-3">
                    <span className="text-[11px] font-light text-[#9A827A] block mb-2">
                      Requested Stock Items ({req.items?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {req.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-lg border border-[#F0E6D8] bg-[#FAF8F7] px-3 py-1.5 text-xs font-light"
                        >
                          <span className="font-normal text-[#2C1E21]">
                            {item.productId?.name || "Product"}
                          </span>
                          <span className="text-[#9A827A]">
                            × {item.quantity}
                          </span>
                          {item.productId?.price && (
                            <span className="text-[10px] text-[#E2C275] font-normal">
                              ({formatCurrency(item.productId.price)})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {req.adminNotes && (
                    <div className="mt-3 rounded-lg bg-[#FAF6EE] p-2.5 text-xs font-light text-[#4A3E3D]">
                      <span className="font-normal text-[#9A827A]">Notes: </span>
                      {req.adminNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Simplified Status Modal */}
      {selectedReqForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C1E21]/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#F0E6D8] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-4 mb-4">
              <h3 className="text-base font-normal text-[#2C1E21]">
                Fulfill or Cancel Request
              </h3>
              <button
                onClick={closeUpdateModal}
                className="text-[#9A827A] hover:text-[#2C1E21] text-lg font-light"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitDispatchUpdate} className="space-y-4 text-xs font-light">
              <div>
                <label className="block text-[#9A827A] mb-1.5">Action Status</label>
                <select
                  value={dispatchForm.status}
                  onChange={(e) =>
                    setDispatchForm({ ...dispatchForm, status: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 text-[#2C1E21] outline-none focus:border-[#E2C275]"
                >
                  <option value="FULFILLED">FULFILLED (Order Completed)</option>
                  <option value="CANCELLED">CANCELLED (Refund to Wallet)</option>
                </select>
                <p className="mt-1 text-[10px] text-[#9A827A]">
                  *CANCELLED selects will un-hold money back into Franchise wallet passbook.
                </p>
              </div>

              <div>
                <label className="block text-[#9A827A] mb-1.5">Internal Admin Notes</label>
                <textarea
                  rows="3"
                  value={dispatchForm.notes}
                  onChange={(e) =>
                    setDispatchForm({ ...dispatchForm, notes: e.target.value })
                  }
                  placeholder="e.g. Stock handed over locally / Goods dispatched via internal vehicle..."
                  className="w-full rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 text-[#2C1E21] outline-none focus:border-[#E2C275]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#F5EFE6]">
                <button
                  type="button"
                  onClick={closeUpdateModal}
                  className="rounded-xl border border-[#F0E6D8] bg-white px-4 py-2 text-[#9A827A] hover:bg-[#FAF6EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.update}
                  className="rounded-xl bg-[#D82348] px-5 py-2 text-white hover:bg-[#9A1B32] disabled:opacity-50"
                >
                  {loading.update ? "Saving..." : "Confirm Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFranchiseSupplyUI;