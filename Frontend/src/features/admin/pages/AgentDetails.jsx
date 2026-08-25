import React, { useState } from "react";
import { useAgentDetail } from "../hook/useAdmin";
import { useNavigate } from "react-router";

// 🌐 Node.js Backend Base URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const AgentDetailPage = ({ agentId, onBack }) => {
  const {
    selectedAgent,
    isDetailLoading,
    isActionLoading,
    error,
    blockModalOpen,
    blockReason,
    setBlockReason,
    setBlockModalOpen,
    toggleStatus,
  } = useAgentDetail();

  const navigate = useNavigate();

  // Modal type tracking for clarity: 'BLOCK' or 'ACTIVATE'
  const [modalType, setModalType] = useState(null); 

  // Document Preview Modal State
  const [docPreview, setDocPreview] = useState({
    isOpen: false,
    title: "",
    url: "",
  });

  // Full Image URL Converter
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:image")) {
      return path;
    }
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${BASE_URL}${cleanPath}`;
  };

  const handleOpenDoc = (title, rawPath) => {
    const fullUrl = getImageUrl(rawPath);
    if (!fullUrl) return;
    setDocPreview({
      isOpen: true,
      title,
      url: fullUrl,
    });
  };

  const handleCloseDoc = () => {
    setDocPreview({ isOpen: false, title: "", url: "" });
  };

  // Open specific action modal
  const handleOpenActionModal = (type) => {
    setModalType(type);
    setBlockModalOpen(true);
  };

  const handleCloseActionModal = () => {
    setBlockModalOpen(false);
    setModalType(null);
    setBlockReason("");
  };

  // --- Loading State Renderer ---
  if (isDetailLoading) {
    return <div className="p-8 text-center text-slate-500">Loading Agent Overview...</div>;
  }

  // --- Error / Empty State Renderer ---
  if (error || !selectedAgent) {
    return (
      <div className="p-6">
        <button 
          type="button"
          onClick={onBack || (() => navigate("/admin/agentList"))} 
          className="text-indigo-600 mb-4 cursor-pointer hover:underline"
        >
          ← Back to Agents
        </button>
        <div className="p-4 bg-rose-50 text-rose-700 rounded-lg">
          {error || "Agent Data Not Found"}
        </div>
      </div>
    );
  }

  const { 
    fullName, 
    email, 
    phone, 
    status, 
    network, 
    revenue, 
    bankDetails, 
    recentWork,
    adharCardImage,
    panCardImage 
  } = selectedAgent;

  const isBlocked = status === "Blocked";
  const isActive = status === "Active";

  const hasAadhar = Boolean(adharCardImage);
  const hasPan = Boolean(panCardImage);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Top Header Controls */}
      <div className="flex justify-between items-center mb-6">
        <button
          type="button"
          onClick={() => (onBack ? onBack() : navigate("/admin/agentList"))}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          ← Back to Agent List
        </button>

        {/* 🔘 Separate Action Buttons Section */}
        <div className="flex items-center gap-3">
          {/* Active Agent Button */}
          <button
            type="button"
            disabled={isActive || isActionLoading}
            onClick={() => handleOpenActionModal("ACTIVATE")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition shadow ${
              isActive
                ? "bg-emerald-100 text-emerald-700 border border-emerald-300 opacity-80 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            }`}
          >
            {isActive ? "✓ Agent Active" : "Activate Agent"}
          </button>

          {/* Block / Unblock Conditional Button */}
          {isBlocked ? (
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => handleOpenActionModal("ACTIVATE")}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow transition cursor-pointer"
            >
              Unblock Agent
            </button>
          ) : (
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => handleOpenActionModal("BLOCK")}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm shadow transition cursor-pointer"
            >
              Block Agent
            </button>
          )}
        </div>
      </div>

      {/* Personal Details Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">{fullName}</h1>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                isActive
                  ? "bg-emerald-100 text-emerald-800"
                  : isBlocked
                  ? "bg-rose-100 text-rose-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {status}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {email} • {phone || "No phone linked"}
          </p>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">Left Team</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {network?.leftCount || 0} Agents
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">Right Team</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {network?.rightCount || 0} Agents
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            ₹{revenue?.totalEarnings?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">Pending Payout</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            ₹{revenue?.pendingPayout?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Grid Section: Bank Details & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Bank Details & KYC</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Account Holder</p>
                <p className="font-medium text-slate-700">{bankDetails?.accountHolder || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Bank Name</p>
                <p className="font-medium text-slate-700">{bankDetails?.bankName || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Account Number</p>
                <p className="font-medium text-slate-700">{bankDetails?.accountNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">IFSC Code</p>
                <p className="font-medium text-slate-700">{bankDetails?.ifscCode || "N/A"}</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* KYC Documents */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3">KYC Documents</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Aadhaar Card</p>
                  <p className="text-[11px] text-slate-400">
                    {hasAadhar ? "Uploaded" : "Not Uploaded"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!hasAadhar}
                  onClick={() => handleOpenDoc("Aadhaar Card", adharCardImage)}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  👁️ Show Aadhaar
                </button>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-slate-700">PAN Card</p>
                  <p className="text-[11px] text-slate-400">
                    {hasPan ? "Uploaded" : "Not Uploaded"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!hasPan}
                  onClick={() => handleOpenDoc("PAN Card", panCardImage)}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  👁️ Show PAN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Work Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Agent Work</h2>
          {!recentWork || recentWork.length === 0 ? (
            <p className="text-slate-400 text-sm">No recent orders found.</p>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b text-xs text-slate-400 uppercase">
                  <th className="py-2">Activity / Member</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentWork.map((work) => (
                  <tr key={work._id}>
                    <td className="py-2.5 font-medium">{work.title}</td>
                    <td className="py-2.5 font-semibold">₹{work.amount}</td>
                    <td className="py-2.5 text-xs text-emerald-600 font-medium">{work.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 🖼️ Document Modal Preview */}
      {docPreview.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-lg w-full p-5 rounded-2xl shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-lg font-bold text-slate-800">{docPreview.title}</h3>
              <button
                type="button"
                onClick={handleCloseDoc}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="flex justify-center items-center bg-slate-100 rounded-lg p-2 min-h-[250px] max-h-[70vh] overflow-auto">
              <img
                src={docPreview.url}
                alt={docPreview.title}
                className="max-w-full max-h-[60vh] object-contain rounded-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/400x250?text=Failed+To+Load+Image";
                }}
              />
            </div>

            <div className="mt-4 flex justify-between items-center">
              <a
                href={docPreview.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:underline"
              >
                🔗 Open full size in new tab
              </a>
              <button
                type="button"
                onClick={handleCloseDoc}
                className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-900 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    
 {blockModalOpen && (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-xl">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
        {modalType === "BLOCK" ? "Block Agent?" : "Activate / Unblock Agent?"}
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        {modalType === "BLOCK"
          ? "Agent ka access restricted ho jayega aur wo Portal use nahi kar payega."
          : "Agent ka access restore ho jayega aur status Active ho jayega."}
      </p>

      {/* Reason TextArea (Only for Block Action) */}
      {modalType === "BLOCK" && (
        <textarea
          placeholder="Reason for blocking..."
          value={blockReason}
          onChange={(e) => setBlockReason(e.target.value)}
          className="w-full p-3 border border-slate-200 rounded-lg text-sm mb-4 focus:ring-2 focus:ring-rose-500 outline-none"
          rows={3}
        />
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCloseActionModal}
          className="px-4 py-2 border rounded-lg text-sm cursor-pointer hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isActionLoading}
          
          onClick={() => toggleStatus(modalType === "BLOCK" ? "Blocked" : "Active")}
          className={`px-4 py-2 rounded-lg text-sm text-white font-medium cursor-pointer ${
            modalType === "BLOCK"
              ? "bg-rose-600 hover:bg-rose-700"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {isActionLoading
            ? "Processing..."
            : modalType === "BLOCK"
            ? "Confirm Block"
            : "Confirm Activate"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default AgentDetailPage;