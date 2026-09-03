import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Wallet,
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building2,
  Lock,
  Loader2,
  RefreshCw,
  Info,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useWallet } from "../hook/useWallet"; // Adjust path as per your directory

const AgentWallet = () => {
  const navigate = useNavigate();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    balances,
    earningsBreakdown,
    payoutEligibility,
    payoutDestination,
    recentTransactions,
    isLoading,
    error,
    successMessage,
    canWithdraw,
    isWithdrawalDayAllowed,
    actionRequiredMessage,
    allowedWithdrawalDays,
    minWithdrawalAmount,
    fetchWalletDetails,
    submitWithdrawalRequest, // Integrated real API handler
    resetWalletToast,
  } = useWallet();

  // Load Wallet Data on Mount
  useEffect(() => {
    fetchWalletDetails();
  }, [fetchWalletDetails]);

  // Handle Manual Refresh
  const handleRefresh = () => {
    fetchWalletDetails(true);
  };

  // Auto Reset Error / Success Banners after 4 sec
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        resetWalletToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, resetWalletToast]);

  // Updated Real API Submission Handler
  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    if (!canWithdraw || isSubmitting) return;

    setIsSubmitting(true);

    const res = await submitWithdrawalRequest(withdrawAmount);

    setIsSubmitting(false);

    if (res?.success) {
      setWithdrawAmount("");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#FAF5EE] space-y-3 font-sans">
        <Loader2 className="w-9 h-9 text-[#DC2643] animate-spin" />
        <p className="text-xs font-medium text-[#2A1815]/70 tracking-widest uppercase">
          Fetching Agent Wallet Details...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF5EE] p-4 sm:p-6 font-sans text-[#2A1815] select-none">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER BAR */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/agent/dashboard")}
              className="p-2.5 bg-[#2A1815] text-[#FAF5EE] hover:bg-[#DC2643] rounded-xl transition-colors duration-200 cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#2A1815] tracking-tight">Agent Wallet & Earnings</h1>
              <p className="text-xs text-[#2A1815]/70 font-light">Track balances, bonuses, and manage monthly withdrawal payouts.</p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center space-x-1.5 bg-white border border-[#D6B265]/40 hover:border-[#2A1815] text-[#2A1815] text-xs font-medium px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#F59E35]" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>

        {/* GLOBAL TOAST ALERTS */}
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

        {/* ACTION REQUIRED & WITHDRAWAL POLICY BANNER */}
        {actionRequiredMessage && (
          <div className="bg-white border-l-4 border-[#DC2643] border-y border-r border-[#D6B265]/30 rounded-2xl p-4 shadow-sm flex items-start space-x-3.5">
            <div className="p-2 bg-[#DC2643]/10 text-[#DC2643] rounded-xl shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#2A1815] uppercase tracking-wide">Notice & Action Required</h4>
              <p className="text-xs text-[#2A1815]/80 font-normal leading-relaxed">{actionRequiredMessage}</p>
              <div className="flex items-center space-x-2 pt-1">
                <span className="inline-flex items-center text-[11px] font-medium text-[#F59E35] bg-[#2A1815] px-2.5 py-0.5 rounded-md">
                  <Calendar className="w-3 h-3 mr-1" /> Allowed Window: {allowedWithdrawalDays?.join("th & ")}th of every month
                </span>
              </div>
            </div>
          </div>
        )}

        {/* CORE BALANCES OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Available Balance */}
          <div className="bg-[#2A1815] text-[#FAF5EE] rounded-2xl p-5 shadow-md border border-[#D6B265]/30 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[#FAF5EE]/70 font-medium">Available Balance</span>
              <div className="w-8 h-8 rounded-xl bg-[#DC2643] flex items-center justify-center text-[#FAF5EE]">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-[#FAF5EE] tracking-tight">
                ₹{balances?.availableBalance?.toLocaleString("en-IN") || "0"}
              </h2>
              <p className="text-[10px] text-[#F59E35] mt-1 font-mono">Ready for withdrawal payout</p>
            </div>
          </div>

          {/* Card 2: Total Earnings */}
          <div className="bg-white text-[#2A1815] rounded-2xl p-5 shadow-xs border border-[#D6B265]/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[#2A1815]/60 font-medium">Total Income</span>
              <div className="w-8 h-8 rounded-xl bg-[#F59E35]/20 text-[#F59E35] flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-[#2A1815] tracking-tight">
                ₹{balances?.totalEarnings?.toLocaleString("en-IN") || "0"}
              </h2>
              <p className="text-[10px] text-[#2A1815]/50 mt-1 font-mono">Cumulative commission earned</p>
            </div>
          </div>

          {/* Card 3: Total Withdrawn */}
          <div className="bg-white text-[#2A1815] rounded-2xl p-5 shadow-xs border border-[#D6B265]/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[#2A1815]/60 font-medium">Total Withdrawn</span>
              <div className="w-8 h-8 rounded-xl bg-[#DC2643]/15 text-[#DC2643] flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-[#2A1815] tracking-tight">
                ₹{balances?.totalWithdrawn?.toLocaleString("en-IN") || "0"}
              </h2>
              <p className="text-[10px] text-[#2A1815]/50 mt-1 font-mono">Settled to bank account</p>
            </div>
          </div>

          {/* Card 4: Pending Payout */}
          <div className="bg-white text-[#2A1815] rounded-2xl p-5 shadow-xs border border-[#D6B265]/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[#2A1815]/60 font-medium">Pending Payout</span>
              <div className="w-8 h-8 rounded-xl bg-[#D6B265]/25 text-[#2A1815] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-[#2A1815] tracking-tight">
                ₹{balances?.pendingPayout?.toLocaleString("en-IN") || "0"}
              </h2>
              <p className="text-[10px] text-[#2A1815]/50 mt-1 font-mono">In admin review process</p>
            </div>
          </div>

        </div>

        {/* MIDDLE SECTION: WITHDRAWAL SECTION & EARNINGS BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* WITHDRAWAL REQUEST FORM (2 Columns) */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#D6B265]/30 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#D6B265]/20 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#2A1815] uppercase tracking-wider flex items-center">
                  <Wallet className="w-4 h-4 mr-2 text-[#DC2643]" /> Send Payout Request
                </h3>
                <p className="text-xs text-[#2A1815]/60 font-light">Submit your balance withdrawal to your configured bank account.</p>
              </div>

              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                  isWithdrawalDayAllowed
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-[#FAF5EE] text-[#DC2643] border border-[#DC2643]/30"
                }`}
              >
                {isWithdrawalDayAllowed ? "Window Open" : "Window Closed"}
              </span>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-[#2A1815]/70 block mb-1">
                    Withdrawal Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Min limit ₹${minWithdrawalAmount || 500}`}
                    disabled={!canWithdraw || isSubmitting}
                    min={minWithdrawalAmount || 500}
                    max={balances?.availableBalance || 0}
                    required
                    className="w-full bg-[#FAF5EE] border border-[#D6B265]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#2A1815] font-mono focus:outline-none focus:border-[#2A1815] disabled:opacity-50 transition-colors"
                  />
                </div>

                {/* Target Bank Details Readonly Box */}
                <div className="bg-[#FAF5EE] border border-[#D6B265]/30 rounded-xl p-3 flex items-start space-x-3">
                  <Building2 className="w-4 h-4 text-[#F59E35] shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5 font-mono">
                    <span className="text-[10px] text-[#2A1815]/60 block font-sans uppercase font-medium">Payout Destination</span>
                    <p className="font-semibold text-[#2A1815]">
                      {payoutDestination?.bankDetails?.bankName || "No Bank Configured"}
                    </p>
                    <p className="text-[11px] text-[#2A1815]/70">
                      Acc: {payoutDestination?.bankDetails?.accountNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Rules List */}
              <div className="bg-[#FAF5EE]/70 rounded-xl p-3 border border-[#D6B265]/20 text-[11px] space-y-1 text-[#2A1815]/70">
                <div className="flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-[#F59E35]" />
                  <span>Withdrawal requests are processed strictly on <strong>5th & 20th</strong> dates.</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#D6B265]" />
                  <span>Approved KYC status is mandatory to qualify for payouts.</span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={!canWithdraw || isSubmitting || !withdrawAmount}
                  className="w-full sm:w-auto bg-[#DC2643] text-[#FAF5EE] hover:bg-[#2A1815] disabled:bg-[#2A1815]/30 disabled:cursor-not-allowed px-6 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Submit Withdrawal Request</span>
                      <ChevronRight className="w-4 h-4 text-[#FAF5EE]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* EARNINGS CATEGORY BREAKDOWN (1 Column) */}
          <div className="bg-white rounded-2xl p-6 border border-[#D6B265]/30 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#2A1815] uppercase tracking-wider mb-1">
                Earnings Breakdown
              </h3>
              <p className="text-xs text-[#2A1815]/60 font-light mb-4">Income distribution from binary & referrals.</p>

              <div className="space-y-3">
                {/* Category 1 */}
                <div className="bg-[#FAF5EE] border border-[#D6B265]/30 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#2A1815] block">Binary Matching Bonus</span>
                    <span className="text-[10px] text-[#2A1815]/60">Pair matching commission</span>
                  </div>
                  <strong className="text-xs font-mono font-bold text-[#DC2643]">
                    ₹{earningsBreakdown?.binaryMatchingBonus?.toLocaleString("en-IN") || "0"}
                  </strong>
                </div>

                {/* Category 2 */}
                <div className="bg-[#FAF5EE] border border-[#D6B265]/30 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#2A1815] block">Direct Referral Bonus</span>
                    <span className="text-[10px] text-[#2A1815]/60">Sponsor direct onboarding</span>
                  </div>
                  <strong className="text-xs font-mono font-bold text-[#F59E35]">
                    ₹{earningsBreakdown?.directReferralBonus?.toLocaleString("en-IN") || "0"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="border-t border-[#D6B265]/20 pt-3 flex items-center justify-between text-xs text-[#2A1815]/70">
              <span>KYC Clearance Status:</span>
              <strong className={`font-semibold ${payoutDestination?.kycStatus === "Approved" ? "text-emerald-700" : "text-[#DC2643]"}`}>
                {payoutDestination?.kycStatus || "Pending"}
              </strong>
            </div>
          </div>

        </div>

        {/* RECENT TRANSACTIONS TABLE */}
        <div className="bg-white rounded-2xl p-6 border border-[#D6B265]/30 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#2A1815] uppercase tracking-wider">Recent Wallet Activity Log</h3>
              <p className="text-xs text-[#2A1815]/60 font-light">Latest transactions recorded in your agent ledger.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D6B265]/20 text-[11px] text-[#2A1815]/60 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Transaction ID</th>
                  <th className="py-3 px-3">Title & Category</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6B265]/15 text-xs">
                {recentTransactions && recentTransactions.length > 0 ? (
                  recentTransactions.map((txn) => (
                    <tr key={txn.transactionId || txn._id} className="hover:bg-[#FAF5EE]/60 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-[#2A1815]/80 font-medium">
                        {txn.transactionId}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-[#2A1815] block">{txn.title}</span>
                        <span className="text-[10px] text-[#2A1815]/60">{txn.category || "Bonus"}</span>
                      </td>
                      <td className="py-3 px-3 text-[11px] font-mono text-[#2A1815]/70">
                        {new Date(txn.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                            txn.transactionType === "Credit"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-[#DC2643]/10 text-[#DC2643]"
                          }`}
                        >
                          {txn.transactionType}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-medium ${
                            txn.status === "Completed"
                              ? "text-emerald-700"
                              : txn.status === "Pending"
                              ? "text-[#F59E35]"
                              : "text-[#DC2643]"
                          }`}
                        >
                          ● {txn.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#2A1815]">
                        {txn.transactionType === "Credit" ? "+" : "-"}₹{txn.amount?.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-xs text-[#2A1815]/50 font-light">
                      No recent transactions available in your ledger.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AgentWallet;