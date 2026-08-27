import React, { useState, useEffect } from "react";
import useFranchiseManage from "../hook/useFranchisekycVerify";

const FranchiseGovernanceUI = () => {
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' | 'hierarchy'
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const {
    pendingApplications,
    totalPending,
    hierarchy,
    hierarchyCount,
    loading,
    error,
    successMessage,
    fetchPending,
    handleReviewApplication,
    fetchHierarchy,
    handleUpdateStatus,
    resetMessages,
  } = useFranchiseManage();

  useEffect(() => {
    if (activeTab === "pending") {
      fetchPending();
    } else {
      fetchHierarchy();
    }
  }, [activeTab, fetchPending, fetchHierarchy]);

  const onApprove = async (id) => {
    await handleReviewApplication(id, "APPROVE");
  };

  const onConfirmReject = async (id) => {
    if (!rejectionReason.trim()) return;
    await handleReviewApplication(id, "REJECT", rejectionReason);
    setRejectingId(null);
    setRejectionReason("");
  };

  const onStatusChange = async (id, newStatus) => {
    await handleUpdateStatus(id, newStatus);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] p-6 md:p-10 font-sans font-light text-[#3D2623]">
      {/* Header Bar */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EADCC9] pb-5">
        <div>
          <h1 className="text-2xl font-light tracking-wide text-[#3D2623] flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[#C28E5C]"></span>
            Franchise Onboarding & KYC
          </h1>
          <p className="text-xs font-light text-[#85573C] mt-1">
            Review pending KYC submissions and manage operational hub permissions
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-xl border border-[#EADCC9] bg-white p-1 shadow-sm">
          <button
            onClick={() => {
              resetMessages();
              setActiveTab("pending");
            }}
            className={`rounded-lg px-4 py-2 text-xs font-light tracking-wide transition ${
              activeTab === "pending"
                ? "bg-[#3D2623] text-[#FAF6F0] shadow-sm"
                : "text-[#85573C] hover:text-[#3D2623]"
            }`}
          >
            Pending KYC ({totalPending || 0})
          </button>
          <button
            onClick={() => {
              resetMessages();
              setActiveTab("hierarchy");
            }}
            className={`rounded-lg px-4 py-2 text-xs font-light tracking-wide transition ${
              activeTab === "hierarchy"
                ? "bg-[#3D2623] text-[#FAF6F0] shadow-sm"
                : "text-[#85573C] hover:text-[#3D2623]"
            }`}
          >
            Network Outlets ({hierarchyCount || 0})
          </button>
        </div>
      </header>

      {/* Alert Messages */}
      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[#85573C]/30 bg-[#85573C]/10 p-4 text-xs font-light text-[#3D2623]">
          <span><strong className="font-normal">Error:</strong> {error}</span>
          <button onClick={resetMessages} className="text-[#85573C] underline">Dismiss</button>
        </div>
      )}
      {successMessage && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[#C28E5C]/40 bg-[#C28E5C]/15 p-4 text-xs font-light text-[#3D2623]">
          <span>{successMessage}</span>
          <button onClick={resetMessages} className="text-[#85573C] underline">Dismiss</button>
        </div>
      )}

      {/* Tab 1: Pending KYC Applications */}
      {activeTab === "pending" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-normal text-[#3D2623]">Applications Awaiting Verification</h2>
            <button
              onClick={() => fetchPending()}
              disabled={loading.pending}
              className="text-xs font-light text-[#85573C] hover:text-[#3D2623] disabled:opacity-50"
            >
              {loading.pending ? "Refreshing..." : "Refresh List"}
            </button>
          </div>

          {loading.pending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-24 w-full animate-pulse rounded-2xl bg-[#F4ECDF]" />
              ))}
            </div>
          ) : pendingApplications.length === 0 ? (
            <div className="rounded-2xl border border-[#EADCC9] bg-white p-10 text-center text-xs font-light text-[#85573C]">
              No pending applications found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingApplications.map((app) => (
                <div
                  key={app._id}
                  className="rounded-2xl border border-[#EADCC9] bg-white p-5 shadow-sm transition hover:border-[#C28E5C]/60"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Basic Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-normal text-[#3D2623]">
                          {app.fullName || "Unnamed Applicant"}
                        </h3>
                        <span className="rounded-full bg-[#C28E5C]/15 px-2.5 py-0.5 text-[10px] font-light uppercase tracking-widest text-[#85573C]">
                          {app.franchiseType || "Standard"} Tier
                        </span>
                      </div>
                      <p className="text-xs font-light text-[#85573C]">
                        {app.email} • {app.address?.district}, {app.address?.state}
                      </p>
                      <p className="text-[11px] font-light text-[#85573C]/70">
                        Submitted on: {new Date(app.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onApprove(app._id)}
                        disabled={loading.review}
                        className="rounded-xl bg-[#C28E5C] px-4 py-2 text-xs font-light tracking-wide text-white transition hover:bg-[#A87444] disabled:opacity-50"
                      >
                        Approve KYC
                      </button>
                      <button
                        onClick={() => setRejectingId(rejectingId === app._id ? null : app._id)}
                        disabled={loading.review}
                        className="rounded-xl border border-[#85573C]/40 bg-white px-4 py-2 text-xs font-light tracking-wide text-[#85573C] transition hover:bg-[#85573C]/10 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Rejection Form Drawer */}
                  {rejectingId === app._id && (
                    <div className="mt-4 border-t border-[#EADCC9] pt-4">
                      <label className="block text-xs font-light text-[#85573C] mb-1.5">
                        Reason for rejection:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="e.g., Invalid document proof provided"
                          className="flex-1 rounded-xl border border-[#EADCC9] bg-[#FAF6F0] px-3.5 py-2 text-xs font-light text-[#3D2623] outline-none focus:border-[#C28E5C]"
                        />
                        <button
                          onClick={() => onConfirmReject(app._id)}
                          disabled={!rejectionReason.trim() || loading.review}
                          className="rounded-xl bg-[#3D2623] px-4 py-2 text-xs font-light text-[#FAF6F0] hover:bg-[#2A1917] disabled:opacity-50"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Hierarchy & Status Overrides */}
      {activeTab === "hierarchy" && (
        <section className="rounded-2xl border border-[#EADCC9] bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-[#FAF6F0] pb-4">
            <div>
              <h2 className="text-sm font-normal text-[#3D2623]">Active Franchise Network</h2>
              <p className="text-xs font-light text-[#85573C] mt-0.5">
                Overview of onboarded hubs sorted by region
              </p>
            </div>
            <button
              onClick={() => fetchHierarchy()}
              disabled={loading.hierarchy}
              className="text-xs font-light text-[#85573C] hover:text-[#3D2623] disabled:opacity-50"
            >
              {loading.hierarchy ? "Refreshing..." : "Refresh List"}
            </button>
          </div>

          {loading.hierarchy ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-10 w-full animate-pulse rounded-xl bg-[#F4ECDF]" />
              ))}
            </div>
          ) : hierarchy.length === 0 ? (
            <div className="py-12 text-center text-xs font-light text-[#85573C]">
              No active franchises registered.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-light">
                <thead>
                  <tr className="border-b border-[#EADCC9] text-[#85573C]">
                    <th className="pb-3 font-normal">Franchise Outlet</th>
                    <th className="pb-3 font-normal">Tier</th>
                    <th className="pb-3 font-normal">Location</th>
                    <th className="pb-3 font-normal">Status</th>
                    <th className="pb-3 text-right font-normal">Override Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF6F0]">
                  {hierarchy.map((item) => (
                    <tr key={item._id} className="transition hover:bg-[#FAF6F0]/50">
                      <td className="py-3.5 font-normal text-[#3D2623]">
                        {item.fullName}
                        <span className="block text-[11px] font-light text-[#85573C]">
                          {item.email}
                        </span>
                      </td>
                      <td className="py-3.5 text-[#85573C]">{item.franchiseType || "Standard"}</td>
                      <td className="py-3.5 text-[#85573C]">
                        {item.address?.district}, {item.address?.state}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-light tracking-wide ${
                            item.status === "ACTIVE"
                              ? "bg-[#C28E5C]/20 text-[#3D2623]"
                              : item.status === "SUSPENDED"
                              ? "bg-[#F99834]/20 text-[#794A31]"
                              : "bg-[#3D2623]/10 text-[#3D2623]"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <select
                          value={item.status}
                          onChange={(e) => onStatusChange(item._id, e.target.value)}
                          disabled={loading.statusUpdate}
                          className="rounded-lg border border-[#EADCC9] bg-[#FAF6F0] px-2.5 py-1 text-xs font-light text-[#3D2623] outline-none focus:border-[#C28E5C]"
                        >
                          <option value="ACTIVE">Set Active</option>
                          <option value="SUSPENDED">Set Suspended</option>
                          <option value="BLOCKED">Set Blocked</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default FranchiseGovernanceUI;