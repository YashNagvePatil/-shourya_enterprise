import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import useFranchiseSupply from "../hook/useFranchiseSupply";
import {
  getFranchiseHierarchy,
  sendDirectSupplyToFranchise,
} from "../service/franchiseManage.api";

const ManageFranchiseSupplyUI = () => {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedReqForUpdate, setSelectedReqForUpdate] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({
    status: "Dispatched",
    notes: "",
  });

  // Modal State for Direct Product Dispatching by Admin
  const [isSendProductModalOpen, setIsSendProductModalOpen] = useState(false);
  const [franchisesList, setFranchisesList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loadingModalData, setLoadingModalData] = useState(false);
  const [sendForm, setSendForm] = useState({
    targetFranchiseId: "",
    notes: "",
    items: [{ productId: "", quantity: 1 }],
  });
  const [sendingLoading, setSendingLoading] = useState(false);
  const [directSuccessMsg, setDirectSuccessMsg] = useState(null);

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

  // Open Direct Send Product Modal
  const openSendProductModal = async () => {
    setIsSendProductModalOpen(true);
    setDirectSuccessMsg(null);
    if (franchisesList.length === 0 || productsList.length === 0) {
      setLoadingModalData(true);
      try {
        const [hierRes, prodRes] = await Promise.all([
          getFranchiseHierarchy(),
          axios.get("http://localhost:3000/api/products", { withCredentials: true }),
        ]);

        const fList = hierRes?.hierarchy || hierRes?.data || (Array.isArray(hierRes) ? hierRes : []);
        const pList = prodRes.data?.products || prodRes.data?.data || (Array.isArray(prodRes.data) ? prodRes.data : []);

        setFranchisesList(fList);
        setProductsList(pList);
      } catch (err) {
        console.error("Error fetching modal data:", err);
      } finally {
        setLoadingModalData(false);
      }
    }
  };

  const closeSendProductModal = () => {
    setIsSendProductModalOpen(false);
    setSendForm({
      targetFranchiseId: "",
      notes: "",
      items: [{ productId: "", quantity: 1 }],
    });
  };

  const handleAddSendItem = () => {
    setSendForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1 }],
    }));
  };

  const handleRemoveSendItem = (index) => {
    if (sendForm.items.length === 1) return;
    setSendForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSendItemChange = (index, field, value) => {
    const updated = [...sendForm.items];
    updated[index][field] = field === "quantity" ? Math.max(1, Number(value)) : value;
    setSendForm((prev) => ({ ...prev, items: updated }));
  };

  const handleSubmitDirectSend = async (e) => {
    e.preventDefault();
    if (!sendForm.targetFranchiseId) return;
    const validItems = sendForm.items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) return;

    try {
      setSendingLoading(true);
      const res = await sendDirectSupplyToFranchise({
        targetFranchiseId: sendForm.targetFranchiseId,
        items: validItems,
        notes: sendForm.notes,
      });

      if (res.success) {
        setDirectSuccessMsg(res.message || "Products dispatched successfully!");
        closeSendProductModal();
        fetchSupplyRequests({ status: statusFilter });
      }
    } catch (err) {
      console.error("Error sending products:", err);
    } finally {
      setSendingLoading(false);
    }
  };

  const openUpdateModal = (req) => {
    setSelectedReqForUpdate(req);
    setDispatchForm({
      status: "Dispatched",
      notes: req.adminNotes || req.dispatchNotes || "",
    });
  };

  const closeUpdateModal = () => {
    setSelectedReqForUpdate(null);
    setDispatchForm({ status: "Dispatched", notes: "" });
  };

  const submitDispatchUpdate = async (e) => {
    e.preventDefault();
    if (!selectedReqForUpdate) return;

    try {
      await handleUpdateDispatchStatus(selectedReqForUpdate._id, dispatchForm);
      closeUpdateModal();
      fetchSupplyRequests({ status: statusFilter });
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

  // Color Palette from Theme Image:
  // Stripe 1: Deep Crimson Red (#D82348 / #9A1B32)
  // Stripe 2: Warm Vibrant Amber-Orange (#F99834)
  // Stripe 3: Soft Gold / Muted Warm Yellow (#E2C275)
  // Stripe 4: Soft Cream / Warm Off-White (#FAF6EE / #FDFBF7)

  const getStatusBadgeStyle = (status) => {
    const s = status?.toUpperCase();
    switch (s) {
      case "RECEIVED":
        return "bg-[#D82348]/10 text-[#D82348] border-[#D82348]/30 font-medium";
      case "DISPATCHED":
        return "bg-[#E2C275]/25 text-[#926A18] border-[#E2C275]/60 font-medium";
      case "CANCELLED":
      case "REJECTED":
        return "bg-[#9A1B32]/15 text-[#9A1B32] border-[#9A1B32]/30 font-medium";
      case "PROCESS":
      case "PENDING":
      default:
        return "bg-[#F99834]/15 text-[#D97706] border-[#F99834]/40 font-medium";
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

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-10 font-sans font-light text-[#4A3E3D]">
      {/* Back to Manage Franchise Navigation Button */}
      <div className="mb-5">
        <Link
          to="/admin/franchiseManageDashboard"
          className="inline-flex items-center gap-2 text-xs font-normal text-[#9A827A] hover:text-[#D82348] bg-white border border-[#F0E6D8] px-3.5 py-2 rounded-xl shadow-2xs transition hover:bg-[#FAF6EE]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Manage Franchise Dashboard</span>
        </Link>
      </div>

      {/* Header Bar */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#F0E6D8] pb-5">
        <div>
          <h1 className="text-2xl font-light tracking-wide text-[#2C1E21] flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-[#D82348]"></span>
            Manage Franchise Supply & Product Dispatching
          </h1>
          <p className="text-xs font-light text-[#9A827A] mt-1">
            Dispatch inventory to franchises, review order requests, and monitor delivery confirmation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openSendProductModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D82348] px-4 py-2 text-xs font-normal tracking-wide text-white shadow-2xs transition hover:bg-[#9A1B32] cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            + Send Products to Franchise
          </button>

          <button
            onClick={() => fetchSupplyRequests({ status: statusFilter })}
            disabled={loading.fetch}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2C275]/70 bg-white px-4 py-2 text-xs font-light tracking-wide text-[#9A1B32] shadow-2xs transition hover:bg-[#FAF6EE] hover:border-[#F99834] active:bg-[#FAF6EE] disabled:opacity-50 cursor-pointer"
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
            Refresh Data
          </button>
        </div>
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
      {(successMessage || directSuccessMsg) && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[#E2C275]/70 bg-[#FAF6EE] p-4 text-xs font-light text-[#2C1E21]">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D82348]" />
            {successMessage || directSuccessMsg}
          </span>
          <button onClick={() => { resetMessages(); setDirectSuccessMsg(null); }} className="text-[#9A827A] underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Status Filter Tabs (Themed) */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-[#F0E6D8] pb-4">
        {[
          { key: "ALL", label: "All Requests" },
          { key: "Process", label: "Process (Pending)" },
          { key: "Dispatched", label: "Dispatched" },
          { key: "Received", label: "Successfully Received" },
          { key: "Cancelled", label: "Cancelled" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleFilterChange(tab.key)}
            className={`rounded-xl px-4 py-1.5 text-xs font-light transition tracking-wide ${
              statusFilter === tab.key
                ? "bg-[#D82348] text-white shadow-2xs font-normal"
                : "bg-white text-[#9A827A] border border-[#F0E6D8] hover:bg-[#FAF6EE] hover:text-[#2C1E21]"
            }`}
          >
            {tab.label} {statusFilter === tab.key ? `(${count})` : ""}
          </button>
        ))}
      </div>

      {/* Supply Request List */}
      <main className="rounded-2xl border border-[#F0E6D8] bg-white p-6 shadow-2xs">
        <div className="mb-6 flex items-center justify-between border-b border-[#FAF6EE] pb-4">
          <h2 className="text-sm font-normal text-[#2C1E21]">
            Global Supply Orders ({count})
          </h2>
          <span className="text-xs font-light text-[#9A827A]">
            Active Filter: <strong className="font-normal text-[#2C1E21]">{statusFilter}</strong>
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
              const requester = req.requesterFranchise || {};
              const totalCost =
                req.totalAmount ||
                req.items?.reduce(
                  (sum, i) => sum + (i.productId?.price || 0) * (i.quantity || 1),
                  0
                );

              const currentStatus = req.status || "Process";
              const isDispatched = currentStatus === "Dispatched";
              const isReceived = currentStatus === "Received";

              return (
                <div
                  key={req._id}
                  className="rounded-2xl border border-[#F0E6D8] bg-white p-5 shadow-2xs transition hover:border-[#E2C275]/80 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Header Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-xs text-[#D82348] font-medium">
                          #{req.requestNumber || req._id?.slice(-6)}
                        </span>
                        <h3 className="text-base font-normal text-[#2C1E21]">
                          {requester.fullName || "Franchise Outlet"}
                        </h3>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest ${getStatusBadgeStyle(
                            currentStatus
                          )}`}
                        >
                          {getStatusLabel(currentStatus)}
                        </span>
                        <span className="rounded-md bg-[#FAF6EE] border border-[#E2C275]/50 px-2 py-0.5 text-[10px] font-light text-[#926A18] uppercase">
                          {req.requesterType || requester.franchiseType || "State"} Tier
                        </span>
                      </div>
                      <p className="text-xs font-light text-[#9A827A]">
                        {requester.email} • {requester.mobile || "N/A"} •{" "}
                        {req.requesterLocation?.district || requester.address?.district || "Location N/A"},{" "}
                        {req.requesterLocation?.state || requester.address?.state || ""}
                      </p>
                    </div>

                    {/* Cost & Action */}
                    <div className="flex items-center gap-4 justify-between lg:justify-end border-t border-[#FAF6EE] lg:border-t-0 pt-3 lg:pt-0">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] uppercase font-light tracking-widest text-[#9A827A] block">
                          Total Value
                        </span>
                        <span className="text-base font-medium text-[#2C1E21]">
                          {formatCurrency(totalCost)}
                        </span>
                      </div>

                      {currentStatus === "Process" || currentStatus === "PENDING" ? (
                        <button
                          onClick={() => openUpdateModal(req)}
                          className="rounded-xl border border-[#D82348] bg-[#D82348] text-white px-4 py-2 text-xs font-normal transition hover:bg-[#9A1B32] shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span>Dispatch Products</span>
                        </button>
                      ) : isDispatched ? (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E2C275]/20 border border-[#E2C275]/60 text-[#8A6A1C] text-xs font-normal">
                            <span className="w-2 h-2 rounded-full bg-[#F99834] animate-pulse" />
                            Dispatched (Awaiting Receipt)
                          </span>
                        </div>
                      ) : isReceived ? (
                        <span className="px-3 py-1.5 rounded-xl bg-[#D82348]/10 border border-[#D82348]/30 text-[#D82348] text-xs font-normal">
                          ✓ Successfully Received
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-[#FAF8F7] border border-[#F0E6D8] text-[#9A827A] text-xs font-light">
                          {getStatusLabel(currentStatus)}
                        </span>
                      )}
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
                          className="flex items-center gap-2 rounded-lg border border-[#F0E6D8] bg-[#FAF6EE] px-3 py-1.5 text-xs font-light"
                        >
                          <span className="font-normal text-[#2C1E21]">
                            {item.productId?.name || `Product ID: ${item.productId}`}
                          </span>
                          <span className="text-[#9A827A] font-medium">
                            × {item.quantity}
                          </span>
                          {item.unitPrice && (
                            <span className="text-[10px] text-[#F99834] font-normal">
                              ({formatCurrency(item.unitPrice)})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {(req.adminNotes || req.dispatchNotes) && (
                    <div className="mt-3 rounded-lg bg-[#FAF6EE] border border-[#F0E6D8] p-2.5 text-xs font-light text-[#4A3E3D]">
                      <span className="font-normal text-[#9A827A]">Dispatch Notes: </span>
                      {req.adminNotes || req.dispatchNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal 1: Send Products to Franchise directly by Admin */}
      {isSendProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C1E21]/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#F0E6D8] bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-4">
              <div>
                <h3 className="text-base font-normal text-[#2C1E21]">
                  Send Products to Franchise
                </h3>
                <p className="text-xs text-[#9A827A]">
                  Select target franchise and dispatch product inventory directly.
                </p>
              </div>
              <button
                onClick={closeSendProductModal}
                className="text-[#9A827A] hover:text-[#2C1E21] text-lg font-light cursor-pointer"
              >
                ✕
              </button>
            </div>

            {loadingModalData ? (
              <div className="py-8 text-center text-xs text-[#9A827A]">
                Loading franchises & products catalog...
              </div>
            ) : (
              <form onSubmit={handleSubmitDirectSend} className="space-y-4 text-xs font-light">
                <div>
                  <label className="block text-[#9A827A] mb-1.5 font-normal">
                    Target Franchise Outlet
                  </label>
                  <select
                    required
                    value={sendForm.targetFranchiseId}
                    onChange={(e) =>
                      setSendForm({ ...sendForm, targetFranchiseId: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 text-[#2C1E21] outline-none focus:border-[#D82348] font-normal"
                  >
                    <option value="">-- Select Franchise Outlet --</option>
                    {franchisesList.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.fullName} ({f.franchiseType || "State"} — {f.address?.district || f.address?.state || "N/A"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-[#9A827A] font-normal">
                    Select Products & Quantities
                  </label>
                  {sendForm.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        required
                        value={item.productId}
                        onChange={(e) =>
                          handleSendItemChange(index, "productId", e.target.value)
                        }
                        className="flex-1 rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 text-[#2C1E21] text-xs outline-none focus:border-[#D82348] font-normal"
                      >
                        <option value="">-- Select Product --</option>
                        {productsList.map((prod) => (
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
                          handleSendItemChange(index, "quantity", e.target.value)
                        }
                        className="w-20 rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 text-[#2C1E21] text-xs outline-none focus:border-[#D82348]"
                      />

                      {sendForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSendItem(index)}
                          className="p-2 text-rose-600 hover:text-rose-800 text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddSendItem}
                    className="text-xs text-[#D82348] font-normal hover:underline cursor-pointer"
                  >
                    + Add Another Product
                  </button>
                </div>

                <div>
                  <label className="block text-[#9A827A] mb-1.5 font-normal">
                    Dispatch / Tracking Notes
                  </label>
                  <textarea
                    rows="3"
                    value={sendForm.notes}
                    onChange={(e) =>
                      setSendForm({ ...sendForm, notes: e.target.value })
                    }
                    placeholder="e.g. Dispatched via Express Courier / Batch #4092 / Vehicle MH-12..."
                    className="w-full rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 text-[#2C1E21] outline-none focus:border-[#D82348]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#F5EFE6]">
                  <button
                    type="button"
                    onClick={closeSendProductModal}
                    className="rounded-xl border border-[#F0E6D8] bg-white px-4 py-2 text-[#9A827A] hover:bg-[#FAF6EE] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingLoading}
                    className="rounded-xl bg-[#D82348] px-5 py-2 text-white font-normal hover:bg-[#9A1B32] disabled:opacity-50 transition cursor-pointer"
                  >
                    {sendingLoading ? "Dispatching..." : "Confirm & Send Products"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Dispatch / Update existing request */}
      {selectedReqForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C1E21]/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#F0E6D8] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-4">
              <div>
                <h3 className="text-base font-normal text-[#2C1E21]">
                  Dispatch Supply Products
                </h3>
                <p className="text-xs text-[#9A827A]">
                  Request #{selectedReqForUpdate.requestNumber}
                </p>
              </div>
              <button
                onClick={closeUpdateModal}
                className="text-[#9A827A] hover:text-[#2C1E21] text-lg font-light cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitDispatchUpdate} className="space-y-4 text-xs font-light">
              <div>
                <label className="block text-[#9A827A] mb-1.5 font-normal">
                  Action Status
                </label>
                <select
                  value={dispatchForm.status}
                  onChange={(e) =>
                    setDispatchForm({ ...dispatchForm, status: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 text-[#2C1E21] outline-none focus:border-[#D82348] font-normal"
                >
                  <option value="Dispatched">Dispatched (Send Product to Franchise)</option>
                  <option value="Cancelled">Cancelled (Cancel & Refund Money)</option>
                </select>
                <p className="mt-1 text-[10px] text-[#9A827A]">
                  *Setting status to Dispatched lets franchise verify and mark "Successfully Received".
                </p>
              </div>

              <div>
                <label className="block text-[#9A827A] mb-1.5 font-normal">
                  Dispatch / Tracking Notes
                </label>
                <textarea
                  rows="3"
                  value={dispatchForm.notes}
                  onChange={(e) =>
                    setDispatchForm({ ...dispatchForm, notes: e.target.value })
                  }
                  placeholder="e.g. Dispatched via Express Courier / Batch #4092 / Vehicle MH-12..."
                  className="w-full rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 text-[#2C1E21] outline-none focus:border-[#D82348]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#F5EFE6]">
                <button
                  type="button"
                  onClick={closeUpdateModal}
                  className="rounded-xl border border-[#F0E6D8] bg-white px-4 py-2 text-[#9A827A] hover:bg-[#FAF6EE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.update}
                  className="rounded-xl bg-[#D82348] px-5 py-2 text-white font-normal hover:bg-[#9A1B32] disabled:opacity-50 transition cursor-pointer"
                >
                  {loading.update ? "Saving..." : "Confirm Dispatch"}
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