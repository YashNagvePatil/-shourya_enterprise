import React, { useState, useEffect } from "react";
import useFranchiseFinancials from "../hook/useManageFranchisefinance";

const ManageFranchiseFinancials = () => {
  // Modal States
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [reviewAction, setReviewAction] = useState("APPROVED"); // 'APPROVED' | 'REJECTED'
  const [reviewForm, setReviewForm] = useState({ referenceNo: "", rejectionReason: "" });

  const [isManualSettlementOpen, setIsManualSettlementOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    franchiseId: "",
    amount: "",
    payoutType: "RENT",
    referenceNo: "",
    notes: ""
  });

  const [ledgerModalFranchise, setLedgerModalFranchise] = useState(null);

  // Hook Destructuring (Synced with updated hook)
  const {
    payouts = [],
    systemLiabilities = { totalPendingRent: 0, totalPendingRoi: 0, totalWalletBalance: 0 },
    pendingWithdrawals = [],
    selectedFranchiseLedger = { transactions: [], payouts: [] },
    loading = { summary: false, settlement: false, reviewWithdrawal: false, ledger: false },
    error,
    successMessage,
    fetchFinancialSummary,
    handleProcessSettlement,
    handleReviewWithdrawal,
    fetchFranchiseLedger,
    resetMessages,
    resetFranchiseLedger,
  } = useFranchiseFinancials();

  useEffect(() => {
    fetchFinancialSummary();
  }, [fetchFinancialSummary]);

  // Handle Review Action Submit (Approve/Reject Withdrawal)
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedWithdrawal) return;

    try {
      const payload = {
        status: reviewAction,
        ...(reviewAction === "APPROVED"
          ? { referenceNo: reviewForm.referenceNo }
          : { rejectionReason: reviewForm.rejectionReason }),
      };

      await handleReviewWithdrawal(selectedWithdrawal._id, payload);
      closeReviewModal();
    } catch (err) {
      // Handled in Redux State
    }
  };

  // Handle Manual Settlement Submit (Direct Payout Push)
  const handleSubmitManualSettlement = async (e) => {
    e.preventDefault();
    try {
      await handleProcessSettlement({
        ...manualForm,
        amount: Number(manualForm.amount),
      });
      setIsManualSettlementOpen(false);
      setManualForm({ franchiseId: "", amount: "", payoutType: "RENT", referenceNo: "", notes: "" });
    } catch (err) {
      // Handled in Redux State
    }
  };

  // Open Ledger Modal
  const openLedger = (franchise) => {
    setLedgerModalFranchise(franchise);
    fetchFranchiseLedger(franchise._id);
  };

  const closeLedger = () => {
    setLedgerModalFranchise(null);
    resetFranchiseLedger();
  };

  const closeReviewModal = () => {
    setSelectedWithdrawal(null);
    setReviewForm({ referenceNo: "", rejectionReason: "" });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-10 font-sans font-light text-[#4A3E3D]">
      {/* Header Bar */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#F0E6D8] pb-5">
        <div>
          <h1 className="text-2xl font-light tracking-wide text-[#2C1E21] flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[#D82348]"></span>
            Financial Allocations & Settlements
          </h1>
          <p className="text-xs font-light text-[#9A827A] mt-1">
            Monitor liabilities, review outlet withdrawal requests, and execute direct settlements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsManualSettlementOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2C1E21] px-4 py-2 text-xs font-light tracking-wide text-white shadow-sm transition hover:bg-[#4A3E3D]"
          >
            + Direct Settlement
          </button>

          <button
            onClick={fetchFinancialSummary}
            disabled={loading.summary}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2C275]/60 bg-white px-4 py-2 text-xs font-light tracking-wide text-[#9A1B32] shadow-sm transition hover:bg-[#F99834]/10 hover:border-[#F99834] active:bg-[#F99834]/20 disabled:opacity-50"
          >
            <svg
              className={`h-4 w-4 text-[#D82348] ${loading.summary ? "animate-spin" : ""}`}
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
            Refresh
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
      {successMessage && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[#E2C275]/60 bg-[#FAF6EE] p-4 text-xs font-light text-[#2C1E21]">
          <span>{successMessage}</span>
          <button onClick={resetMessages} className="text-[#9A827A] underline">
            Dismiss
          </button>
        </div>
      )}

      {/* System Liabilities Overview Section */}
      <section className="mb-8">
        <h3 className="text-xs font-normal uppercase tracking-widest text-[#9A827A] mb-3">
          System Liabilities & Reserves
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* Pending Rent Liability */}
          <div className="rounded-2xl border border-[#F0E6D8] bg-white p-5 shadow-sm">
            <span className="text-[10px] font-light uppercase tracking-widest text-[#9A827A]">
              Pending Rent Liability
            </span>
            <h2 className="mt-2 text-2xl font-light text-[#D82348]">
              {formatCurrency(systemLiabilities.totalPendingRent)}
            </h2>
            <p className="mt-1 text-[11px] text-[#9A827A]">Unsettled rent due to hub operators</p>
          </div>

          {/* Pending ROI Liability */}
          <div className="rounded-2xl border border-[#F0E6D8] bg-white p-5 shadow-sm">
            <span className="text-[10px] font-light uppercase tracking-widest text-[#9A827A]">
              Pending ROI Liability
            </span>
            <h2 className="mt-2 text-2xl font-light text-[#F99834]">
              {formatCurrency(systemLiabilities.totalPendingRoi)}
            </h2>
            <p className="mt-1 text-[11px] text-[#9A827A]">Unclaimed guaranteed returns</p>
          </div>

          {/* Total Network Balance */}
          <div className="rounded-2xl border border-[#F0E6D8] bg-white p-5 shadow-sm">
            <span className="text-[10px] font-light uppercase tracking-widest text-[#9A827A]">
              Total Outlets Balance
            </span>
            <h2 className="mt-2 text-2xl font-light text-[#2C1E21]">
              {formatCurrency(systemLiabilities.totalWalletBalance)}
            </h2>
            <p className="mt-1 text-[11px] text-[#9A827A]">Combined liquid cash in partner wallets</p>
          </div>
        </div>
      </section>

      {/* Historical Payout Aggregates */}
      <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#F0E6D8] bg-white/60 p-4">
          <span className="text-[10px] font-light uppercase text-[#9A827A]">Total Rent Paid Out</span>
          <p className="text-lg font-light text-[#2C1E21] mt-1">
            {formatCurrency(payouts.find((p) => p._id === "RENT")?.totalAmount)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#F0E6D8] bg-white/60 p-4">
          <span className="text-[10px] font-light uppercase text-[#9A827A]">Total ROI Distributed</span>
          <p className="text-lg font-light text-[#2C1E21] mt-1">
            {formatCurrency(payouts.find((p) => p._id === "ROI")?.totalAmount)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#F0E6D8] bg-white/60 p-4">
          <span className="text-[10px] font-light uppercase text-[#9A827A]">Total Commission Paid</span>
          <p className="text-lg font-light text-[#2C1E21] mt-1">
            {formatCurrency(payouts.find((p) => p._id === "COMMISSION")?.totalAmount)}
          </p>
        </div>
      </section>

      {/* Pending Withdrawal Requests Main Table */}
      <main className="rounded-2xl border border-[#F0E6D8] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-[#FAF6EE] pb-4">
          <div>
            <h2 className="text-sm font-normal text-[#2C1E21]">
              Pending Withdrawal Requests ({pendingWithdrawals.length})
            </h2>
            <p className="text-xs font-light text-[#9A827A] mt-0.5">
              Review, approve, or reject withdrawal claims submitted by partners
            </p>
          </div>
        </div>

        {loading.summary ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 w-full animate-pulse rounded-2xl bg-[#FAF6EE]" />
            ))}
          </div>
        ) : pendingWithdrawals.length === 0 ? (
          <div className="py-16 text-center text-xs font-light text-[#9A827A]">
            No pending withdrawal requests. All settlements are up to date.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingWithdrawals.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-[#F0E6D8] bg-white p-5 shadow-sm transition hover:border-[#E2C275]/80 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-normal text-[#2C1E21]">
                        {item.franchiseId?.fullName || "Outlet Partner"}
                      </h3>
                      <span className="rounded-full bg-[#E2C275]/20 px-2.5 py-0.5 text-[10px] font-light uppercase tracking-widest text-[#B8943D]">
                        {item.franchiseId?.franchiseType || "OUTLET"}
                      </span>
                    </div>
                    <p className="text-xs font-light text-[#9A827A]">{item.franchiseId?.email}</p>

                    {item.franchiseId?.bankDetails && (
                      <p className="text-[11px] font-light text-[#9A827A]">
                        Bank:{" "}
                        <span className="font-normal text-[#2C1E21]">
                          {item.franchiseId.bankDetails.bankName}
                        </span>{" "}
                        • A/C: ••••{String(item.franchiseId.bankDetails.accountNumber).slice(-4)} •
                        IFSC: {item.franchiseId.bankDetails.ifscCode}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-6 border-t border-[#FAF6EE] pt-3 md:border-t-0 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-light tracking-widest text-[#9A827A] block">
                        Requested Amount
                      </span>
                      <span className="text-lg font-light text-[#2C1E21]">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openLedger(item.franchiseId)}
                        className="rounded-xl border border-[#F0E6D8] px-3 py-2 text-xs text-[#9A827A] hover:bg-[#FAF6EE]"
                      >
                        Passbook
                      </button>

                      <button
                        onClick={() => setSelectedWithdrawal(item)}
                        className="rounded-xl bg-[#D82348] px-4 py-2 text-xs font-light tracking-wide text-white transition hover:bg-[#9A1B32]"
                      >
                        Review Request
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL 1: Review Withdrawal (Approve / Reject) */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C1E21]/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#F0E6D8] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-3 mb-4">
              <h3 className="text-base font-normal text-[#2C1E21]">Review Withdrawal Request</h3>
              <button onClick={closeReviewModal} className="text-[#9A827A] text-lg">
                ✕
              </button>
            </div>

            <div className="mb-4 rounded-xl bg-[#FAF6EE] p-3 text-xs">
              <p>
                <strong>Partner:</strong> {selectedWithdrawal.franchiseId?.fullName}
              </p>
              <p>
                <strong>Amount:</strong> {formatCurrency(selectedWithdrawal.amount)}
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-light">
              <div>
                <label className="block text-[#9A827A] mb-1">Action</label>
                <select
                  value={reviewAction}
                  onChange={(e) => setReviewAction(e.target.value)}
                  className="w-full rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 outline-none"
                >
                  <option value="APPROVED">Approve Withdrawal</option>
                  <option value="REJECTED">Reject Withdrawal</option>
                </select>
              </div>

              {reviewAction === "APPROVED" ? (
                <div>
                  <label className="block text-[#9A827A] mb-1">Bank Reference / UTR Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UTR-982347102"
                    value={reviewForm.referenceNo}
                    onChange={(e) => setReviewForm({ ...reviewForm, referenceNo: e.target.value })}
                    className="w-full rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[#9A827A] mb-1">Rejection Reason</label>
                  <textarea
                    required
                    placeholder="Explain why request was rejected..."
                    value={reviewForm.rejectionReason}
                    onChange={(e) => setReviewForm({ ...reviewForm, rejectionReason: e.target.value })}
                    className="w-full rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-[#F5EFE6]">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="rounded-xl border border-[#F0E6D8] px-4 py-2 text-[#9A827A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.reviewWithdrawal}
                  className={`rounded-xl px-5 py-2 text-white ${
                    reviewAction === "APPROVED" ? "bg-[#D82348]" : "bg-[#2C1E21]"
                  }`}
                >
                  {loading.reviewWithdrawal ? "Saving..." : "Confirm Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Manual Direct Settlement Modal */}
      {isManualSettlementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C1E21]/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#F0E6D8] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-3 mb-4">
              <h3 className="text-base font-normal text-[#2C1E21]">Direct Manual Settlement</h3>
              <button onClick={() => setIsManualSettlementOpen(false)} className="text-[#9A827A] text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitManualSettlement} className="space-y-4 text-xs font-light">
              <div>
                <label className="block text-[#9A827A] mb-1">Franchise MongoDB ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 64f19988a12bc20019a99887"
                  value={manualForm.franchiseId}
                  onChange={(e) => setManualForm({ ...manualForm, franchiseId: e.target.value })}
                  className="w-full rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-[#9A827A] mb-1">Payout Type</label>
                <select
                  value={manualForm.payoutType}
                  onChange={(e) => setManualForm({ ...manualForm, payoutType: e.target.value })}
                  className="w-full rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 outline-none"
                >
                  <option value="RENT">Rent</option>
                  <option value="ROI">ROI</option>
                  <option value="COMMISSION">Commission</option>
                </select>
              </div>

              <div>
                <label className="block text-[#9A827A] mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={manualForm.amount}
                  onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                  className="w-full rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-[#9A827A] mb-1">Bank Reference No (UTR)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TXN9823182"
                  value={manualForm.referenceNo}
                  onChange={(e) => setManualForm({ ...manualForm, referenceNo: e.target.value })}
                  className="w-full rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#F5EFE6]">
                <button
                  type="button"
                  onClick={() => setIsManualSettlementOpen(false)}
                  className="rounded-xl border border-[#F0E6D8] px-4 py-2 text-[#9A827A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.settlement}
                  className="rounded-xl bg-[#2C1E21] px-5 py-2 text-white"
                >
                  {loading.settlement ? "Processing..." : "Process Payout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Passbook Audit Ledger Modal */}
      {ledgerModalFranchise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C1E21]/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-[#F0E6D8] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-3 mb-4">
              <h3 className="text-base font-normal text-[#2C1E21]">
                Passbook: {ledgerModalFranchise.fullName}
              </h3>
              <button onClick={closeLedger} className="text-[#9A827A] text-lg">
                ✕
              </button>
            </div>

            {loading.ledger ? (
              <p className="text-center py-8 text-xs text-[#9A827A]">Loading passbook transactions...</p>
            ) : selectedFranchiseLedger.transactions.length === 0 ? (
              <p className="text-center py-8 text-xs text-[#9A827A]">No wallet transactions found.</p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#F0E6D8] text-[#9A827A]">
                    <th className="py-2">Date</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Description</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Balance After</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFranchiseLedger.transactions.map((tx) => (
                    <tr key={tx._id} className="border-b border-[#FAF6EE]">
                      <td className="py-2.5 text-[#9A827A]">
                        {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-2.5 font-medium">{tx.type}</td>
                      <td className="py-2.5 text-[#9A827A]">{tx.description}</td>
                      <td
                        className={`py-2.5 font-normal ${
                          tx.type === "WITHDRAWAL" ? "text-[#D82348]" : "text-emerald-600"
                        }`}
                      >
                        {tx.type === "WITHDRAWAL" ? "-" : "+"}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-2.5 font-normal text-[#2C1E21]">
                        {formatCurrency(tx.balanceAfter)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFranchiseFinancials;