import React, { useState, useEffect } from "react";
import useFranchiseFinancials from "../hook/useManageFranchisefinance";

const ManageFranchiseFinancials = () => {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [settlementForm, setSettlementForm] = useState({
    franchiseId: "",
    amount: "",
    payoutType: "COMMISSION",
    referenceNo: "",
  });

  const {
    payouts = [],
    pendingWithdrawals = [],
    loading = { summary: false, settlement: false },
    error,
    successMessage,
    fetchFinancialSummary,
    handleProcessSettlement,
    resetMessages,
  } = useFranchiseFinancials();

  useEffect(() => {
    fetchFinancialSummary();
  }, [fetchFinancialSummary]);

  const openSettlementModal = (item) => {
    setSelectedWithdrawal(item);
    setSettlementForm({
      franchiseId: item.franchiseId?._id || item.franchiseId || "",
      amount: item.amount || "",
      payoutType: item.type || "COMMISSION",
      referenceNo: `SETTLE-${Date.now().toString().slice(-6)}`,
    });
  };

  const closeSettlementModal = () => {
    setSelectedWithdrawal(null);
    setSettlementForm({
      franchiseId: "",
      amount: "",
      payoutType: "COMMISSION",
      referenceNo: "",
    });
  };

  const handleSubmitSettlement = async (e) => {
    e.preventDefault();
    if (
      !settlementForm.franchiseId ||
      !settlementForm.amount ||
      !settlementForm.referenceNo
    )
      return;

    try {
      await handleProcessSettlement({
        ...settlementForm,
        amount: Number(settlementForm.amount),
      });
      closeSettlementModal();
    } catch (err) {
      // Error is caught and stored in redux state via hook
    }
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
            Monitor payout liabilities, ROI allocations, and process outlet withdrawals
          </p>
        </div>

        <button
          onClick={fetchFinancialSummary}
          disabled={loading.summary}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2C275]/60 bg-white px-4 py-2 text-xs font-light tracking-wide text-[#9A1B32] shadow-sm transition hover:bg-[#F99834]/10 hover:border-[#F99834] active:bg-[#F99834]/20 disabled:opacity-50"
        >
          <svg
            className={`h-4 w-4 text-[#D82348] ${
              loading.summary ? "animate-spin" : ""
            }`}
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
          Refresh Financials
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

      {/* Financial Payout Summary Cards */}
      <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Rent Liabilities */}
        <div className="rounded-2xl border border-[#F0E6D8] bg-white p-5 shadow-sm transition hover:border-[#E2C275] hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-light uppercase tracking-widest text-[#9A827A]">
              Rent Liabilities
            </span>
            <span className="rounded-full bg-[#D82348]/10 p-2 text-[#D82348]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            {loading.summary ? (
              <div className="h-7 w-28 animate-pulse rounded bg-[#FAF6EE]" />
            ) : (
              <h2 className="text-2xl font-light tracking-tight text-[#2C1E21]">
                {formatCurrency(payouts.find((p) => p._id === "RENT")?.totalAmount)}
              </h2>
            )}
            <p className="mt-1 text-[11px] font-light text-[#9A827A]">
              {payouts.find((p) => p._id === "RENT")?.count || 0} Settled Claims
            </p>
          </div>
        </div>

        {/* ROI Allocations */}
        <div className="rounded-2xl border border-[#F0E6D8] bg-white p-5 shadow-sm transition hover:border-[#E2C275] hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-light uppercase tracking-widest text-[#9A827A]">
              ROI Allocations
            </span>
            <span className="rounded-full bg-[#F99834]/15 p-2 text-[#F99834]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            {loading.summary ? (
              <div className="h-7 w-28 animate-pulse rounded bg-[#FAF6EE]" />
            ) : (
              <h2 className="text-2xl font-light tracking-tight text-[#2C1E21]">
                {formatCurrency(payouts.find((p) => p._id === "ROI")?.totalAmount)}
              </h2>
            )}
            <p className="mt-1 text-[11px] font-light text-[#9A827A]">
              {payouts.find((p) => p._id === "ROI")?.count || 0} Distributions
            </p>
          </div>
        </div>

        {/* Commissions */}
        <div className="rounded-2xl border border-[#F0E6D8] bg-white p-5 shadow-sm transition hover:border-[#E2C275] hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-light uppercase tracking-widest text-[#9A827A]">
              Commissions
            </span>
            <span className="rounded-full bg-[#E2C275]/25 p-2 text-[#B8943D]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            {loading.summary ? (
              <div className="h-7 w-28 animate-pulse rounded bg-[#FAF6EE]" />
            ) : (
              <h2 className="text-2xl font-light tracking-tight text-[#2C1E21]">
                {formatCurrency(payouts.find((p) => p._id === "COMMISSION")?.totalAmount)}
              </h2>
            )}
            <p className="mt-1 text-[11px] font-light text-[#9A827A]">
              {payouts.find((p) => p._id === "COMMISSION")?.count || 0} Paid Outs
            </p>
          </div>
        </div>
      </section>

      {/* Pending Withdrawal Requests */}
      <main className="rounded-2xl border border-[#F0E6D8] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-[#FAF6EE] pb-4">
          <div>
            <h2 className="text-sm font-normal text-[#2C1E21]">
              Pending Withdrawal Requests ({pendingWithdrawals.length})
            </h2>
            <p className="text-xs font-light text-[#9A827A] mt-0.5">
              Review and settle balance payout requests submitted by hub operators
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
                      <span className="rounded-full bg-[#D82348]/10 px-2.5 py-0.5 text-[10px] font-light uppercase tracking-widest text-[#D82348]">
                        PENDING
                      </span>
                    </div>
                    <p className="text-xs font-light text-[#9A827A]">
                      {item.franchiseId?.email}
                    </p>
                    {item.franchiseId?.bankDetails && (
                      <p className="text-[11px] font-light text-[#9A827A]">
                        Bank:{" "}
                        <span className="font-normal text-[#2C1E21]">
                          {item.franchiseId.bankDetails.bankName || "Verified Account"}
                        </span>
                        {item.franchiseId.bankDetails.accountNumber && (
                          <span>
                            {" "}
                            • A/C: ••••
                            {String(
                              item.franchiseId.bankDetails.accountNumber
                            ).slice(-4)}
                          </span>
                        )}
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

                    <button
                      onClick={() => openSettlementModal(item)}
                      className="rounded-xl bg-[#D82348] px-4 py-2 text-xs font-light tracking-wide text-white transition hover:bg-[#9A1B32] active:bg-[#7D1528]"
                    >
                      Process Settlement
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Process Settlement Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C1E21]/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#F0E6D8] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-4 mb-4">
              <h3 className="text-base font-normal text-[#2C1E21]">
                Execute Settlement
              </h3>
              <button
                onClick={closeSettlementModal}
                className="text-[#9A827A] hover:text-[#2C1E21] text-lg font-light"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmitSettlement}
              className="space-y-4 text-xs font-light"
            >
              <div>
                <label className="block text-[#9A827A] mb-1">
                  Franchise Outlet ID
                </label>
                <input
                  type="text"
                  value={settlementForm.franchiseId}
                  onChange={(e) =>
                    setSettlementForm({
                      ...settlementForm,
                      franchiseId: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 text-[#2C1E21] outline-none focus:border-[#E2C275]"
                />
              </div>

              <div>
                <label className="block text-[#9A827A] mb-1">Payout Type</label>
                <select
                  value={settlementForm.payoutType}
                  onChange={(e) =>
                    setSettlementForm({
                      ...settlementForm,
                      payoutType: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 text-[#2C1E21] outline-none focus:border-[#E2C275]"
                >
                  <option value="COMMISSION">Commission</option>
                  <option value="RENT">Rent</option>
                  <option value="ROI">ROI</option>
                </select>
              </div>

              <div>
                <label className="block text-[#9A827A] mb-1">
                  Settlement Amount (₹)
                </label>
                <input
                  type="number"
                  value={settlementForm.amount}
                  onChange={(e) =>
                    setSettlementForm({
                      ...settlementForm,
                      amount: e.target.value,
                    })
                  }
                  required
                  placeholder="0.00"
                  className="w-full rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 text-[#2C1E21] outline-none focus:border-[#E2C275]"
                />
              </div>

              <div>
                <label className="block text-[#9A827A] mb-1">
                  Transaction Reference Number
                </label>
                <input
                  type="text"
                  value={settlementForm.referenceNo}
                  onChange={(e) =>
                    setSettlementForm({
                      ...settlementForm,
                      referenceNo: e.target.value,
                    })
                  }
                  required
                  placeholder="e.g. UTR-982347102"
                  className="w-full rounded-xl border border-[#F0E6D8] bg-[#FAF6EE] p-2.5 text-[#2C1E21] outline-none focus:border-[#E2C275]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#F5EFE6]">
                <button
                  type="button"
                  onClick={closeSettlementModal}
                  className="rounded-xl border border-[#F0E6D8] bg-white px-4 py-2 text-[#9A827A] hover:bg-[#FAF6EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.settlement}
                  className="rounded-xl bg-[#D82348] px-5 py-2 text-white hover:bg-[#9A1B32] disabled:opacity-50"
                >
                  {loading.settlement ? "Processing..." : "Confirm & Pay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFranchiseFinancials;