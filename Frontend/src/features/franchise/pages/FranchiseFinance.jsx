import React, { useState, useEffect } from "react";
import { useFranchiseFinance } from "../hooks/useFranchiseFinance"; 

const FranchiseFinance = () => {
  const {
    financials,
    wallet,
    bankDetailsConfigured,
    activePendingWithdrawal,
    passbookTransactions,
    passbookPagination,
    analytics,
    analyticsFilter,
    loading,
    passbookLoading,
    actionLoading,
    error,
    successMessage,
    fetchOverview,
    fetchPassbook,
    fetchAnalyticsData,
    handleRequestWithdrawal,
    handleCancelWithdrawal,
    changeFilter,
    clearMessages,
  } = useFranchiseFinance();

  // Modal State for Withdrawal Request
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNotes, setWithdrawNotes] = useState("");

  // Passbook Filter State
  const [selectedType, setSelectedType] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Initial Data Fetch
  useEffect(() => {
    fetchOverview();
    fetchAnalyticsData(analyticsFilter);
  }, [fetchOverview, fetchAnalyticsData, analyticsFilter]);

  // Fetch Passbook on Filter or Page Change
  useEffect(() => {
    fetchPassbook({ page: currentPage, limit: 8, type: selectedType });
  }, [fetchPassbook, currentPage, selectedType]);

  const onWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;

    const success = await handleRequestWithdrawal(
      Number(withdrawAmount),
      withdrawNotes
    );
    if (success) {
      setWithdrawAmount("");
      setWithdrawNotes("");
      setIsWithdrawModalOpen(false);
    }
  };

  const onCancelRequest = async (withdrawalId) => {
    if (window.confirm("Are you sure you want to cancel this pending withdrawal request?")) {
      await handleCancelWithdrawal(withdrawalId);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] font-light text-slate-700 p-6 md:p-10 space-y-8">
      {/* ----------------- Top Navigation / Header ----------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-[#E3C279]/30 shadow-sm gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-[#D92344] font-normal">
            Financial Management
          </span>
          <h1 className="text-2xl font-light text-slate-800 tracking-tight">
            Finance & Wallet Ledger
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              clearMessages();
              setIsWithdrawModalOpen(true);
            }}
            disabled={Boolean(activePendingWithdrawal) || !bankDetailsConfigured}
            className={`px-5 py-2.5 rounded-xl text-xs font-normal transition-all shadow-md ${
              activePendingWithdrawal || !bankDetailsConfigured
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-[#D92344] hover:bg-[#b81b37] text-white shadow-[#D92344]/20 active:scale-95"
            }`}
          >
            {activePendingWithdrawal
              ? "Withdrawal Pending Review"
              : "Request Payout"}
          </button>
        </div>
      </div>

      {/* ----------------- Alert Notifications ----------------- */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearMessages} className="font-normal text-red-900">
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={clearMessages} className="font-normal text-emerald-950">
            ✕
          </button>
        </div>
      )}

      {!bankDetailsConfigured && (
        <div className="p-4 rounded-xl bg-[#F28E2B]/10 border border-[#F28E2B]/40 text-[#F28E2B] text-xs flex items-center justify-between">
          <span>
            ⚠️ Bank Profile is incomplete. Please update your account details to request payouts.
          </span>
        </div>
      )}

      {/* ----------------- Active Withdrawal Banner ----------------- */}
      {activePendingWithdrawal && (
        <div className="p-5 bg-gradient-to-r from-[#F28E2B]/15 to-[#E3C279]/20 border border-[#F28E2B]/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F28E2B] animate-ping" />
            <div>
              <p className="font-normal text-slate-800">
                Pending Withdrawal Request:{" "}
                <span className="text-slate-900 font-medium">
                  ₹{activePendingWithdrawal.amount?.toLocaleString()}
                </span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Submitted on:{" "}
                {new Date(activePendingWithdrawal.requestedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => onCancelRequest(activePendingWithdrawal._id)}
            disabled={actionLoading}
            className="px-4 py-1.5 bg-white text-[#D92344] border border-[#D92344]/30 hover:bg-[#D92344] hover:text-white transition-all rounded-lg text-[11px] font-normal"
          >
            {actionLoading ? "Processing..." : "Cancel Request"}
          </button>
        </div>
      )}

      {/* ----------------- Top Financial Summary Cards ----------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Main Wallet Balance Card */}
        <div className="bg-gradient-to-br from-[#D92344] to-[#b81b37] text-white p-6 rounded-2xl shadow-lg shadow-[#D92344]/15 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-red-100/80 font-normal">
              Available Wallet Balance
            </span>
            <p className="text-3xl font-light mt-3 tracking-tight">
              {loading ? "..." : `₹${wallet?.balance?.toLocaleString() || 0}`}
            </p>
          </div>
          <span className="text-[11px] text-red-100/70 mt-4 block">
            Ready for settlement
          </span>
        </div>

        {/* Secondary Metric Cards */}
        {[
          {
            label: "Total Earned",
            value: `₹${wallet?.totalEarned?.toLocaleString() || 0}`,
            accent: "border-[#F28E2B]",
            textColor: "text-[#F28E2B]",
          },
          {
            label: "Total Withdrawn",
            value: `₹${wallet?.totalWithdrawn?.toLocaleString() || 0}`,
            accent: "border-[#E3C279]",
            textColor: "text-slate-800",
          },
          {
            label: "Pending Rent",
            value: `₹${wallet?.pendingRent?.toLocaleString() || 0}`,
            accent: "border-slate-300",
            textColor: "text-slate-800",
          },
          {
            label: "Pending ROI",
            value: `₹${wallet?.pendingRoi?.toLocaleString() || 0}`,
            accent: "border-stone-300",
            textColor: "text-slate-800",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`bg-white p-5 rounded-2xl border-l-4 ${card.accent} border-y border-r border-[#E3C279]/30 shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-0.5`}
          >
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-normal">
              {card.label}
            </span>
            <p className={`text-2xl font-light mt-2 ${card.textColor}`}>
              {loading ? "..." : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* ----------------- Analytics Bar Chart Section ----------------- */}
      <div className="bg-white p-6 rounded-2xl border border-[#E3C279]/30 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-normal text-slate-800">
              Earnings Throughput
            </h2>
            <p className="text-[11px] text-slate-400">
              Visual analytics representation of payouts
            </p>
          </div>

          <div className="flex bg-[#FAF6EE] p-1 rounded-xl border border-[#E3C279]/30 text-xs font-normal">
            {["daily", "weekly", "monthly", "yearly"].map((filter) => (
              <button
                key={filter}
                onClick={() => changeFilter(filter)}
                className={`px-3 py-1 rounded-lg capitalize transition-all ${
                  analyticsFilter === filter
                    ? "bg-white text-[#D92344] shadow-sm font-normal"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Chart Container */}
        <div className="h-56 flex items-end justify-between gap-3 pt-6 px-4 border-b border-slate-100 relative">
          {analytics && analytics.length > 0 ? (
            analytics.map((bar, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer relative"
              >
                {/* Hover Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-md pointer-events-none z-10 whitespace-nowrap font-light">
                  ₹{bar.amount?.toLocaleString() || 0}
                </div>

                {/* Animated Gradient Bar */}
                <div
                  style={{ height: bar.heightPercentage || "5%" }}
                  className="w-full max-w-[32px] bg-gradient-to-t from-[#F28E2B] to-[#E3C279] rounded-t-lg transition-all group-hover:from-[#D92344] group-hover:to-[#F28E2B]"
                />
                <span className="text-[11px] text-slate-400 font-light">
                  {bar.label}
                </span>
              </div>
            ))
          ) : (
            <div className="w-full flex justify-center items-center h-full text-xs text-slate-400 font-light">
              No chart data found for this period.
            </div>
          )}
        </div>
      </div>

      {/* ----------------- Passbook Audit Ledger Section ----------------- */}
      <div className="bg-white rounded-2xl border border-[#E3C279]/30 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-sm font-normal text-slate-800">
              Passbook Ledger Audit Trail
            </h2>
            <p className="text-[11px] text-slate-400">
              Complete transaction log history
            </p>
          </div>

          {/* Type Filter Dropdown */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-[#FAF6EE] border border-[#E3C279]/40 rounded-xl focus:outline-none focus:border-[#D92344] text-slate-600 font-light"
          >
            <option value="ALL">All Types</option>
            <option value="RENT">Rent Payouts</option>
            <option value="ROI">ROI Settlements</option>
            <option value="COMMISSION">Commissions</option>
            <option value="WITHDRAWAL_REQUEST">Withdrawal Requests</option>
            <option value="WITHDRAWAL_REFUND">Withdrawal Refunds</option>
          </select>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EE] text-slate-400 uppercase tracking-wider text-[10px] border-y border-[#E3C279]/20">
              <tr>
                <th className="py-3 px-6 font-normal">Date & Time</th>
                <th className="py-3 px-6 font-normal">Description</th>
                <th className="py-3 px-6 font-normal">Type</th>
                <th className="py-3 px-6 font-normal text-right">Amount</th>
                <th className="py-3 px-6 font-normal text-right">
                  Balance After
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-slate-600">
              {passbookLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400">
                    Loading ledger data...
                  </td>
                </tr>
              ) : passbookTransactions && passbookTransactions.length > 0 ? (
                passbookTransactions.map((tx) => {
                  const isCredit = [
                    "RENT",
                    "ROI",
                    "COMMISSION",
                    "CREDIT",
                    "WITHDRAWAL_REFUND",
                  ].includes(tx.type);

                  return (
                    <tr
                      key={tx._id}
                      className="hover:bg-[#FAF6EE]/50 transition-colors"
                    >
                      <td className="py-3.5 px-6 whitespace-nowrap font-light text-slate-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-6 max-w-xs truncate font-light">
                        {tx.description}
                      </td>
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-normal border ${
                            isCredit
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 px-6 text-right whitespace-nowrap font-normal ${
                          isCredit ? "text-emerald-600" : "text-[#D92344]"
                        }`}
                      >
                        {isCredit ? "+" : "-"}₹
                        {tx.amount?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap font-light text-slate-700">
                        ₹{tx.balanceAfter?.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400">
                    No transactions found in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Control */}
        {passbookPagination?.totalPages > 1 && (
          <div className="p-4 border-t border-stone-100 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-light">
              Page {passbookPagination.currentPage} of{" "}
              {passbookPagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1.5 border border-[#E3C279]/40 rounded-lg disabled:opacity-40 hover:bg-[#FAF6EE]"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= passbookPagination.totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1.5 border border-[#E3C279]/40 rounded-lg disabled:opacity-40 hover:bg-[#FAF6EE]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ----------------- Withdrawal Request Modal ----------------- */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-[#E3C279]/40 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-base font-light text-slate-800">
                Request Payout Withdrawal
              </h3>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onWithdrawSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-light">
                  Available Wallet Balance
                </label>
                <input
                  type="text"
                  disabled
                  value={`₹${wallet?.balance?.toLocaleString() || 0}`}
                  className="w-full p-2.5 bg-[#FAF6EE] border border-stone-200 rounded-xl text-slate-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-light">
                  Withdrawal Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max={wallet?.balance || 0}
                  required
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full p-2.5 border border-[#E3C279]/50 rounded-xl focus:outline-none focus:border-[#D92344] font-light"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-light">
                  Notes / Remarks (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="Additional payout instructions..."
                  value={withdrawNotes}
                  onChange={(e) => setWithdrawNotes(e.target.value)}
                  className="w-full p-2.5 border border-[#E3C279]/50 rounded-xl focus:outline-none focus:border-[#D92344] font-light"
                />
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-stone-100 rounded-xl font-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-[#D92344] hover:bg-[#b81b37] text-white rounded-xl font-normal transition-all shadow-md shadow-[#D92344]/20"
                >
                  {actionLoading ? "Submitting..." : "Confirm Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FranchiseFinance;