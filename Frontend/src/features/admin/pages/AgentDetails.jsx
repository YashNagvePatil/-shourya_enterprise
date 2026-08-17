import React, { useEffect } from "react";
import { useAgentDetail } from "../hook/useAdmin";

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
    loadAgentProfile,
    toggleStatus,
    clearProfile,
  } = useAgentDetail();

  
  useEffect(() => {
    if (agentId) {
      loadAgentProfile(agentId);
    }
    return () => {
      clearProfile();
    };
  }, [agentId, loadAgentProfile, clearProfile]);

  // --- Loading State Renderer ---
  if (isDetailLoading) {
    return <div className="p-8 text-center text-slate-500">Loading Agent Overview...</div>;
  }

  // --- Error / Empty State Renderer ---
  if (error || !selectedAgent) {
    return (
      <div className="p-6">
        <button onClick={onBack} className="text-indigo-600 mb-4">
          ← Back to Agents
        </button>
        <div className="p-4 bg-rose-50 text-rose-700 rounded-lg">
          {error || "Agent Data Not Found"}
        </div>
      </div>
    );
  }

  // Hook dwara mile selectedAgent se data destructure kar rahe hain
  const { fullName, email, phone, status, network, revenue, bankDetails, recentWork } = selectedAgent;
  const isBlocked = status === "Blocked";

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Top Header Controls */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100"
        >
          ← Back to Agent List
        </button>

        <button
          onClick={() => setBlockModalOpen(true)}
          className={`px-5 py-2 rounded-lg text-white font-medium shadow transition ${
            isBlocked ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
          }`}
        >
          {isBlocked ? "Unblock Agent" : "Block Agent"}
        </button>
      </div>

      {/* Personal Details Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">{fullName}</h1>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                status === "Active"
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

      {/* Grid Section: Bank Details & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bank & KYC Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
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

        {/* Recent Work / Orders History Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Agent Work</h2>
          {!recentWork || recentWork.length === 0 ? (
            <p className="text-slate-400 text-sm">No recent orders found.</p>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b text-xs text-slate-400 uppercase">
                  <th className="py-2">Order ID</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentWork.map((work) => (
                  <tr key={work._id}>
                    <td className="py-2.5 font-medium">#{work._id.slice(-6)}</td>
                    <td className="py-2.5 font-semibold">₹{work.amount}</td>
                    <td className="py-2.5 text-xs text-emerald-600 font-medium">{work.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {blockModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {isBlocked ? "Unblock Agent?" : "Block Agent?"}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {isBlocked
                ? "Agent system ko dobara access kar sakega."
                : "Agent ka access restricted ho jayega."}
            </p>

            {!isBlocked && (
              <textarea
                placeholder="Reason for blocking..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full p-3 border rounded-lg text-sm mb-4 focus:ring-2 focus:ring-rose-500 outline-none"
              />
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBlockModalOpen(false)}
                className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isActionLoading}
                onClick={toggleStatus}
                className={`px-4 py-2 rounded-lg text-white font-medium ${
                  isBlocked ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {isActionLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDetailPage;