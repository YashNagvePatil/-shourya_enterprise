import React, { useState } from "react";
import { useAgentDetail } from "../hook/useAdmin";
import { useNavigate } from "react-router";

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
  } = useAgentDetail(agentId);

  const navigate = useNavigate();

  // Modal types: 'BLOCK', 'ACTIVATE', 'APPROVE_KYC', 'REJECT_KYC'
  const [modalType, setModalType] = useState(null);
  const [docPreview, setDocPreview] = useState({
    isOpen: false,
    title: "",
    url: "",
  });

  const targetAgentId = selectedAgent?._id || agentId;

  // Convert relative image path to absolute backend URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("data:image")
    ) {
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

  const handleOpenActionModal = (type) => {
    setModalType(type);
    setBlockModalOpen(true);
  };

  const handleCloseActionModal = () => {
    setBlockModalOpen(false);
    setModalType(null);
    setBlockReason("");
  };

  const handleConfirmAction = () => {
    if (modalType === "BLOCK") {
      toggleStatus({ status: "Blocked" });
    } else if (modalType === "ACTIVATE") {
      toggleStatus({ status: "Active" });
    } else if (modalType === "APPROVE_KYC") {
     toggleStatus({ kycStatus: "Approved" });
    } else if (modalType === "REJECT_KYC") {
      toggleStatus({ kycStatus: "Rejected" });
    }
  };

  if (isDetailLoading) {
    return (
      <div className="p-12 text-center text-[#8C6D58] bg-[#FFFDF9] min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#EAD8C0] border-t-[#D32F2F] mb-3"></div>
        <p className="text-sm font-light">Loading Agent Overview...</p>
      </div>
    );
  }

  if (error || !selectedAgent) {
    return (
      <div className="p-8 bg-[#FFFDF9] min-h-screen font-sans">
        <button
          type="button"
          onClick={onBack || (() => navigate("/admin/agentList"))}
          className="text-[#D32F2F] font-light text-sm mb-4 cursor-pointer hover:underline flex items-center gap-1"
        >
          ← Back to Agents
        </button>
        <div className="p-4 bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] rounded-xl text-sm font-normal">
          {error || `Agent Data Not Found (ID: ${targetAgentId || "N/A"})`}
        </div>
      </div>
    );
  }

  const {
    fullName,
    email,
    phone,
    status,
    kycStatus = "Pending",
    network,
    financials,
    bankDetails,
    recentWork,
    kycDetails,
  } = selectedAgent;

  const isBlocked = status === "Blocked";
  const isActive = status === "Active";
  const isKycApproved = kycStatus === "Approved";
  const isKycRejected = kycStatus === "Rejected";

  const hasAadhar = Boolean(kycDetails?.adharCardImage);
  const hasPan = Boolean(kycDetails?.panCardImage);

  return (
    <div className="p-8 bg-[#FFFDF9] min-h-screen text-[#4A3B32] font-sans">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-[#EAD8C0]/60 pb-6">
        <button
          type="button"
          onClick={() => (onBack ? onBack() : navigate("/admin/agentList"))}
          className="px-4 py-2 bg-[#FFF8F0] border border-[#EAD8C0] rounded-xl text-[#8C6D58] hover:bg-[#FCECDD] text-sm font-normal transition cursor-pointer flex items-center gap-2"
        >
          ← Back to Agent List
        </button>

        {/* Action Buttons: Approve KYC, Activate Agent, Block Agent */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 1. Approve KYC Button */}
          <button
            type="button"
            disabled={isKycApproved || isActionLoading}
            onClick={() => handleOpenActionModal("APPROVE_KYC")}
            className="px-4 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-normal text-sm shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✓ Approve KYC
          </button>

          {/* 2. Activate Agent Button */}
          <button
            type="button"
            disabled={isActive || isActionLoading}
            onClick={() => handleOpenActionModal("ACTIVATE")}
            className="px-4 py-2 rounded-xl bg-[#1976D2] hover:bg-[#1565C0] text-white font-normal text-sm shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Activate Agent
          </button>

          {/* 3. Block Agent Button */}
          <button
            type="button"
            disabled={isBlocked || isActionLoading}
            onClick={() => handleOpenActionModal("BLOCK")}
            className="px-4 py-2 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-normal text-sm shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Block Agent
          </button>
        </div>
      </div>

      {/* Basic Profile Overview Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#EAD8C0] shadow-sm mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#F57C00] text-white font-light flex items-center justify-center text-xl shadow-xs">
            {fullName ? fullName.charAt(0).toUpperCase() : "A"}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-light text-[#2C221E]">{fullName}</h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-normal ${
                  isActive
                    ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]"
                    : isBlocked
                    ? "bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A]"
                    : "bg-[#FFF3E0] text-[#EF6C00] border border-[#FFE0B2]"
                }`}
              >
                Account: {status}
              </span>

              <span
                className={`px-3 py-0.5 rounded-full text-xs font-normal ${
                  isKycApproved
                    ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]"
                    : isKycRejected
                    ? "bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A]"
                    : "bg-[#FFF3E0] text-[#EF6C00] border border-[#FFE0B2]"
                }`}
              >
                KYC: {kycStatus}
              </span>
            </div>
            <p className="text-sm font-light text-[#8C6D58] mt-1">
              {email} • {phone || "No phone linked"}
            </p>
          </div>
        </div>
      </div>

      {/* Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-[#FFF8F0] p-5 rounded-2xl border border-[#EAD8C0] shadow-sm">
          <p className="text-xs font-normal text-[#8C6D58] uppercase tracking-wider">Left Team</p>
          <p className="text-3xl font-light text-[#4A3B32] mt-1">
            {network?.leftCount || 0} <span className="text-sm font-light text-[#8C6D58]">Agents</span>
          </p>
        </div>
        <div className="bg-[#FFF8F0] p-5 rounded-2xl border border-[#EAD8C0] shadow-sm">
          <p className="text-xs font-normal text-[#8C6D58] uppercase tracking-wider">Right Team</p>
          <p className="text-3xl font-light text-[#4A3B32] mt-1">
            {network?.rightCount || 0} <span className="text-sm font-light text-[#8C6D58]">Agents</span>
          </p>
        </div>
        <div className="bg-[#FFF8F0] p-5 rounded-2xl border border-[#EAD8C0] shadow-sm">
          <p className="text-xs font-normal text-[#8C6D58] uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-light text-[#2E7D32] mt-1">
            ₹{financials?.totalEarnings?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-[#FFF8F0] p-5 rounded-2xl border border-[#EAD8C0] shadow-sm">
          <p className="text-xs font-normal text-[#8C6D58] uppercase tracking-wider">Pending Payout</p>
          <p className="text-3xl font-light text-[#F57C00] mt-1">
            ₹{financials?.pendingPayout?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Main Grid: Bank, Documents & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#EAD8C0] shadow-sm h-fit space-y-6">
          <div>
            <h2 className="text-lg font-light text-[#D32F2F] mb-4 border-b border-[#EAD8C0]/50 pb-2">
              Bank Details & KYC
            </h2>
            <div className="space-y-3 text-sm font-normal">
              <div>
                <p className="text-xs font-light text-[#8C6D58]">Account Holder</p>
                <p className="text-[#2C221E]">{bankDetails?.accountHolder || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-light text-[#8C6D58]">Bank Name</p>
                <p className="text-[#2C221E]">{bankDetails?.bankName || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-light text-[#8C6D58]">Account Number</p>
                <p className="text-[#2C221E]">{bankDetails?.accountNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-light text-[#8C6D58]">IFSC Code</p>
                <p className="text-[#2C221E]">{bankDetails?.ifscCode || "N/A"}</p>
              </div>
            </div>
          </div>

          <hr className="border-[#EAD8C0]/60" />

          {/* KYC Documents Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-light text-[#D32F2F]">KYC Documents</h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full ${
                  isKycApproved
                    ? "bg-[#E8F5E9] text-[#2E7D32]"
                    : isKycRejected
                    ? "bg-[#FFEBEE] text-[#C62828]"
                    : "bg-[#FFF3E0] text-[#EF6C00]"
                }`}
              >
                {kycStatus}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#FFF8F0] p-3 rounded-xl border border-[#EAD8C0]">
                <div>
                  <p className="text-xs font-normal text-[#4A3B32]">Aadhaar Card</p>
                  <p className="text-[11px] font-light text-[#8C6D58]">
                    {hasAadhar ? "Uploaded" : "Not Uploaded"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!hasAadhar}
                  onClick={() => handleOpenDoc("Aadhaar Card", kycDetails?.adharCardImage)}
                  className="px-3 py-1.5 text-xs font-normal text-[#D32F2F] bg-white border border-[#EAD8C0] hover:bg-[#FCECDD] rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  👁️ View Card
                </button>
              </div>

              <div className="flex justify-between items-center bg-[#FFF8F0] p-3 rounded-xl border border-[#EAD8C0]">
                <div>
                  <p className="text-xs font-normal text-[#4A3B32]">PAN Card</p>
                  <p className="text-[11px] font-light text-[#8C6D58]">
                    {hasPan ? "Uploaded" : "Not Uploaded"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!hasPan}
                  onClick={() => handleOpenDoc("PAN Card", kycDetails?.panCardImage)}
                  className="px-3 py-1.5 text-xs font-normal text-[#D32F2F] bg-white border border-[#EAD8C0] hover:bg-[#FCECDD] rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  👁️ View Card
                </button>
              </div>
            </div>

            {/* In-Card KYC Quick Actions */}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={isKycApproved || isActionLoading}
                onClick={() => handleOpenActionModal("APPROVE_KYC")}
                className="flex-1 py-2 text-xs font-normal bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Approve KYC
              </button>
              <button
                type="button"
                disabled={isKycRejected || isActionLoading}
                onClick={() => handleOpenActionModal("REJECT_KYC")}
                className="flex-1 py-2 text-xs font-normal bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Reject KYC
              </button>
            </div>
          </div>
        </div>

        {/* Recent Work Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#EAD8C0] shadow-sm">
          <h2 className="text-lg font-light text-[#D32F2F] mb-4 border-b border-[#EAD8C0]/50 pb-2">
            Recent Agent Work
          </h2>
          {!recentWork || recentWork.length === 0 ? (
            <p className="text-[#8C6D58] text-sm font-light">No recent orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#EAD8C0] text-xs font-normal text-[#8C6D58] uppercase">
                    <th className="py-3 px-2">Activity / Member</th>
                    <th className="py-3 px-2">Amount</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EBE0]">
                  {recentWork.map((work) => (
                    <tr key={work._id} className="hover:bg-[#FFF8F0]/50 transition">
                      <td className="py-3 px-2 font-normal text-[#2C221E]">{work.title}</td>
                      <td className="py-3 px-2 font-normal text-[#4A3B32]">₹{work.amount}</td>
                      <td className="py-3 px-2 text-xs font-normal text-[#2E7D32]">{work.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Document Modal Preview */}
      {docPreview.isOpen && (
        <div className="fixed inset-0 bg-[#2C221E]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-lg w-full p-6 rounded-2xl shadow-xl border border-[#EAD8C0] relative">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#EAD8C0]">
              <h3 className="text-lg font-light text-[#D32F2F]">{docPreview.title}</h3>
              <button
                type="button"
                onClick={handleCloseDoc}
                className="text-[#8C6D58] hover:text-[#2C221E] text-xl font-light cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-center items-center bg-[#FFF8F0] rounded-xl p-2 min-h-[250px] max-h-[70vh] overflow-auto border border-[#EAD8C0]">
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

            <div className="mt-5 flex justify-between items-center">
              <a
                href={docPreview.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-normal text-[#D32F2F] hover:underline"
              >
                🔗 Open full size in new tab
              </a>
              <button
                type="button"
                onClick={handleCloseDoc}
                className="px-4 py-2 bg-[#8C6D58] hover:bg-[#4A3B32] text-white text-xs font-normal rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {blockModalOpen && (
        <div className="fixed inset-0 bg-[#2C221E]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-xl border border-[#EAD8C0]">
            <h3 className="text-xl font-light text-[#D32F2F] mb-2">
              {modalType === "BLOCK" && "Block Agent?"}
              {modalType === "ACTIVATE" && "Activate Agent?"}
              {modalType === "APPROVE_KYC" && "Approve Agent KYC?"}
              {modalType === "REJECT_KYC" && "Reject Agent KYC?"}
            </h3>
            <p className="text-sm font-light text-[#8C6D58] mb-4">
              {modalType === "BLOCK" && "Agent access will be restricted."}
              {modalType === "ACTIVATE" && "Agent access will be restored to Active status."}
              {modalType === "APPROVE_KYC" && "Agent KYC status will be set to Approved."}
              {modalType === "REJECT_KYC" && "Agent KYC status will be set to Rejected."}
            </p>

            {modalType === "BLOCK" && (
              <textarea
                placeholder="Reason for blocking..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full p-3 bg-[#FFF8F0] border border-[#EAD8C0] rounded-xl text-sm font-normal text-[#4A3B32] placeholder-[#B08B6E] mb-4 focus:ring-1 focus:ring-[#D32F2F] outline-none"
                rows={3}
              />
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseActionModal}
                className="px-4 py-2 border border-[#EAD8C0] bg-[#FFF8F0] hover:bg-[#FCECDD] rounded-xl text-xs font-normal text-[#8C6D58] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-xs font-normal text-white cursor-pointer transition ${
                  modalType === "BLOCK" || modalType === "REJECT_KYC"
                    ? "bg-[#D32F2F] hover:bg-[#B71C1C]"
                    : "bg-[#2E7D32] hover:bg-[#1B5E20]"
                }`}
              >
                {isActionLoading ? "Processing..." : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDetailPage;