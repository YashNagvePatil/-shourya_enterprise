import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  ShieldCheck,
  CreditCard,
  UserCheck,
  RefreshCw,
  Clock,
  Search,
  X,
  Check,
  Ban,
  Zap,
} from "lucide-react";
import { useAdminPayout } from "../hook/useAdminPayout"; // Adjust import path

const AdminPayout = () => {
  const navigate = useNavigate();

  // Filters & State
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null); // Active modal item
  const [actionType, setActionType] = useState("Approve"); // "Approve" | "Reject"
  const [paymentMode, setPaymentMode] = useState("Razorpay"); // "Razorpay" | "Manual"
  const [rejectionReason, setRejectionReason] = useState("");

  const {
    isLoadingRequests,
    payoutRequests,
    pagination,
    isProcessing,
    successMessage,
    error,
    lastProcessedPayout,
    fetchPayoutRequestsList,
    handleProcessPayout,
    clearPayoutToast,
    clearPayoutState,
  } = useAdminPayout();

  // Load payout requests on status filter change
  useEffect(() => {
    fetchPayoutRequestsList({ status: statusFilter, search: searchTerm });
  }, [statusFilter, fetchPayoutRequestsList]);

  // Auto-clear notification messages
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        clearPayoutToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, clearPayoutToast]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPayoutRequestsList({ status: statusFilter, search: searchTerm });
  };

  // Execute Approve/Reject Action
  const handleSubmitAction = async (e) => {
    e.preventDefault();
    if (!selectedRequest || isProcessing) return;

    const payoutPayload = {
      transactionId: selectedRequest.transactionId,
      action: actionType,
      ...(actionType === "Approve" && { paymentMode }),
      ...(actionType === "Reject" && { rejectionReason }),
    };

    const res = await handleProcessPayout(payoutPayload);

    if (res?.success) {
      setSelectedRequest(null);
      setRejectionReason("");
      // Refresh request list
      fetchPayoutRequestsList({ status: statusFilter, search: searchTerm });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF5EE] p-4 sm:p-6 font-sans text-[#2A1815] select-none">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER BAR */}
        <div className="flex items-center justify-between border-b border-[#D6B265]/30 pb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="p-2.5 bg-[#2A1815] text-[#FAF5EE] hover:bg-[#DC2643] rounded-xl transition-colors duration-200 cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
              title="Back to Admin Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#2A1815] tracking-tight">
                Admin Payout Management
              </h1>
              <p className="text-xs text-[#2A1815]/70 font-light">
                Review agent withdrawal requests and execute payouts via RazorpayX or Manual transfer.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              clearPayoutState();
              fetchPayoutRequestsList({ status: statusFilter });
            }}
            className="flex items-center space-x-1.5 bg-white border border-[#D6B265]/40 hover:border-[#2A1815] text-[#2A1815] text-xs font-medium px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            title="Refresh List & Reset State"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#F59E35]" />
            <span className="hidden sm:inline">Refresh Requests</span>
          </button>
        </div>

        {/* NOTIFICATION MESSAGES */}
        {successMessage && (
          <div className="bg-emerald-900/10 border border-emerald-500/30 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center space-x-2 shadow-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="bg-[#DC2643]/10 border border-[#DC2643]/30 text-[#DC2643] px-4 py-3 rounded-xl text-xs flex items-center space-x-2 shadow-xs animate-fade-in">
            <AlertCircle className="w-4 h-4 text-[#DC2643] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FILTER BAR & SEARCH */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#D6B265]/30 shadow-xs">
          
          {/* Status Tabs */}
          <div className="flex items-center bg-[#FAF5EE] p-1 rounded-xl border border-[#D6B265]/30 w-full sm:w-auto">
            {["Pending", "Completed", "Failed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-[#2A1815] text-[#FAF5EE] shadow-xs"
                    : "text-[#2A1815]/70 hover:text-[#2A1815]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#D6B265]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Agent Name, ID or Tx ID..."
              className="w-full bg-[#FAF5EE] border border-[#D6B265]/40 rounded-xl pl-9 pr-3 py-2 text-xs text-[#2A1815] focus:outline-none focus:border-[#2A1815]"
            />
          </form>
        </div>

        {/* PAYOUT REQUESTS TABLE */}
        <div className="bg-white rounded-2xl border border-[#D6B265]/30 shadow-xs overflow-hidden">
          {isLoadingRequests ? (
            <div className="p-12 text-center text-xs text-[#2A1815]/70 flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#F59E35]" />
              <span>Fetching payout requests...</span>
            </div>
          ) : payoutRequests?.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#2A1815]/60">
              No {statusFilter.toLowerCase()} payout requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF5EE] border-b border-[#D6B265]/30 text-[11px] font-bold text-[#2A1815]/80 uppercase tracking-wider">
                    <th className="p-4">Transaction Details</th>
                    <th className="p-4">Agent Details</th>
                    <th className="p-4">Bank / UPI Information</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D6B265]/20 text-xs">
                  {payoutRequests.map((item) => {
                    const agent = item.agentId || {};
                    const bank = agent.bankDetails || {};

                    return (
                      <tr key={item._id} className="hover:bg-[#FAF5EE]/50 transition-colors">
                        {/* Transaction ID & Date */}
                        <td className="p-4">
                          <div className="font-mono font-semibold text-[#2A1815]">
                            {item.transactionId}
                          </div>
                          <div className="text-[10px] text-[#2A1815]/60">
                            {new Date(item.createdAt).toLocaleString("en-IN")}
                          </div>
                        </td>

                        {/* Agent Info */}
                        <td className="p-4">
                          <div className="font-medium text-[#2A1815]">{agent.fullName || "N/A"}</div>
                          <div className="text-[10px] font-mono text-[#D6B265]">
                            {agent.distributerId || "N/A"} | {agent.contact}
                          </div>
                        </td>

                        {/* Bank / UPI */}
                        <td className="p-4 font-mono text-[11px]">
                          {bank.upiId ? (
                            <div className="text-emerald-800 font-medium">UPI: {bank.upiId}</div>
                          ) : bank.accountNumber ? (
                            <div>
                              <div>A/C: {bank.accountNumber}</div>
                              <div className="text-[10px] text-[#2A1815]/60">
                                IFSC: {bank.ifscCode} ({bank.bankName})
                              </div>
                            </div>
                          ) : (
                            <span className="text-[#DC2643]">Missing Details</span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="p-4 font-mono font-bold text-[#DC2643] text-sm">
                          ₹{item.amount?.toLocaleString("en-IN")}
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                              item.status === "Pending"
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : item.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-red-100 text-red-800 border border-red-300"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="p-4 text-right">
                          {item.status === "Pending" ? (
                            <button
                              onClick={() => setSelectedRequest(item)}
                              className="bg-[#2A1815] text-[#FAF5EE] hover:bg-[#DC2643] px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                            >
                              Process
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#2A1815]/50 italic">Processed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* PROCESS PAYOUT MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#D6B265]/40 shadow-xl space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#D6B265]/20 pb-3">
              <h3 className="text-sm font-bold text-[#2A1815] uppercase tracking-wide flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-[#DC2643]" /> Process Agent Payout
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 text-[#2A1815]/60 hover:text-[#2A1815] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Request Brief Summary */}
            <div className="bg-[#FAF5EE] rounded-xl p-3 border border-[#D6B265]/30 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#2A1815]/70">Agent Name:</span>
                <strong className="text-[#2A1815]">{selectedRequest.agentId?.fullName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2A1815]/70">Distributor ID:</span>
                <span className="font-mono">{selectedRequest.agentId?.distributerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2A1815]/70">Withdrawal Amount:</span>
                <strong className="text-[#DC2643] font-mono text-sm">
                  ₹{selectedRequest.amount?.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            {/* Action Form */}
            <form onSubmit={handleSubmitAction} className="space-y-4">
              
              {/* Select Action (Approve vs Reject) */}
              <div>
                <label className="text-[11px] font-medium text-[#2A1815]/80 block mb-1">
                  Select Action
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType("Approve")}
                    className={`py-2 text-xs font-semibold rounded-xl border flex items-center justify-center space-x-1.5 cursor-pointer ${
                      actionType === "Approve"
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-white text-[#2A1815] border-[#D6B265]/40"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Payout</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType("Reject")}
                    className={`py-2 text-xs font-semibold rounded-xl border flex items-center justify-center space-x-1.5 cursor-pointer ${
                      actionType === "Reject"
                        ? "bg-[#DC2643] text-white border-[#DC2643]"
                        : "bg-white text-[#2A1815] border-[#D6B265]/40"
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Reject Payout</span>
                  </button>
                </div>
              </div>

              {/* Conditional Options for Approve Mode */}
              {actionType === "Approve" ? (
                <div>
                  <label className="text-[11px] font-medium text-[#2A1815]/80 block mb-1">
                    Payout Processing Channel
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#D6B265]/40 rounded-xl px-3 py-2 text-xs text-[#2A1815] focus:outline-none focus:border-[#2A1815]"
                  >
                    <option value="Razorpay">RazorpayX Instant Automated Payout</option>
                    <option value="Manual">Manual Settlement (Offline Transfer)</option>
                  </select>
                  {paymentMode === "Razorpay" && (
                    <p className="text-[10px] text-amber-700 mt-1 flex items-center">
                      <Zap className="w-3 h-3 mr-1 text-amber-600 shrink-0" />
                      Razorpay will automatically transfer funds to the agent's UPI/Bank details.
                    </p>
                  )}
                </div>
              ) : (
                /* Rejection Reason Input */
                <div>
                  <label className="text-[11px] font-medium text-[#2A1815]/80 block mb-1">
                    Rejection Reason
                  </label>
                  <textarea
                    rows="2"
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejecting this withdrawal request..."
                    className="w-full bg-[#FAF5EE] border border-[#D6B265]/40 rounded-xl p-2.5 text-xs text-[#2A1815] focus:outline-none focus:border-[#2A1815] resize-none"
                  />
                </div>
              )}

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#2A1815] rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`px-5 py-2 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 ${
                    actionType === "Approve" ? "bg-emerald-700 hover:bg-emerald-800" : "bg-[#DC2643] hover:bg-[#2A1815]"
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Confirm {actionType}</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPayout;