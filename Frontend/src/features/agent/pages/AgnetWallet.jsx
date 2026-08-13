import React, { useEffect, useState } from "react";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  Building2, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  Loader2
} from "lucide-react";
// Import the custom hook from your hooks directory
import { useAgentWallet } from "../hook/useAgentDashBoard"; 

const WalletPayout = () => {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  
  // Destructure reactive states and service dispatchers from the hook
  const { 
    wallet, 
    isLoading, 
    error, 
    isWithdrawing, 
    fetchWalletDetails, 
    executeWithdrawal 
  } = useAgentWallet();

  // Trigger data synchronization on initial component mount
  useEffect(() => {
    fetchWalletDetails();
  }, [fetchWalletDetails]);

  // Handle live payout submission workflow
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;

    // Execute state layer and backend processing via the custom hook wrapper
    const result = await executeWithdrawal(withdrawAmount);
    
    if (result?.success) {
      alert(result.message || "Payout requested successfully!");
      setWithdrawAmount("");
    } else {
      alert(result?.message || "Something went wrong during settlement");
    }
  };

  // UI Loading State Mask Canvas
  if (isLoading && !wallet) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50/50 space-y-3">
        <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
        <p className="text-xs font-medium text-slate-500 tracking-wide">Syncing secure financial ledger balance...</p>
      </div>
    );
  }

  // UI Error Fallback Banner
  if (error && !wallet) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50/50 p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs max-w-md text-center shadow-sm">
          <p className="font-semibold">Wallet Ledger Connection Timeout</p>
          <p className="mt-1 opacity-90">{error}</p>
        </div>
      </div>
    );
  }

  // Extract financial nodes safely from mapped Redux state structures
  const availableBalance = wallet?.balances?.availableBalance || 0;
  const totalEarnings = wallet?.earningsBreakdown?.totalEarned || 0;
  const totalWithdrawn = wallet?.earningsBreakdown?.totalWithdrawn || 0;
  const destinationBank = wallet?.payoutDestination || null;
  const transactionsList = wallet?.recentTransactions || [];

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Wallet & Payout Ledger</h1>
          <p className="text-xs text-slate-500">Manage your earnings, bonuses, and instantly withdraw nodes settlement.</p>
        </div>

        {/* STATS MATRIX SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Available balance indicator node */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Available Balance</span>
              <span className="text-2xl font-bold text-slate-900">₹{availableBalance.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          {/* Cumulative generated earnings node */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Total Earnings</span>
              <span className="text-2xl font-bold text-slate-900">₹{totalEarnings.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 rounded-lg bg-sky-50 text-sky-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Liquidated and settled balances node */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Total Withdrawn</span>
              <span className="text-2xl font-bold text-slate-900">₹{totalWithdrawn.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-100 text-slate-600">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          
          {/* ACTION INTERFACE: FINANCIAL SETTLEMENT FORM */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Building2 className="w-4 h-4 text-slate-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Request Settlement</h2>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {/* Destination Bank Account Verification Card */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500 block">Select Destination Vault</label>
                {destinationBank ? (
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 block">{destinationBank.bankName || "Settlement Bank"}</span>
                      <span className="text-slate-400 font-mono text-[10px]">Account: {destinationBank.accountMask || "********4321"}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-medium">Verified</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    No verified settlement bank configured
                  </div>
                )}
              </div>

              {/* Settlement Input Control Segment */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500 block">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-medium">₹</span>
                  <input 
                    type="number"
                    max={availableBalance}
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full text-xs pl-7 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 font-mono"
                    disabled={isWithdrawing || availableBalance < 500}
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 block font-light">Minimum withdrawal threshold: ₹500</span>
              </div>

              {/* Submit Execution Action Trigger */}
              <button 
                type="submit"
                disabled={isWithdrawing || !withdrawAmount || availableBalance < 500}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition active:scale-98 flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
              >
                {isWithdrawing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Initiate Payout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* VISUAL REPORT: TRANSACTION HISTORY LEDGER LOGS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] md:col-span-2 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Transaction History</h2>
              </div>
              <span className="text-[10px] text-slate-400 font-light">Showing latest logs</span>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {transactionsList.length > 0 ? (
                transactionsList.map((txn) => (
                  <div key={txn.id} className="py-3 flex items-center justify-between text-xs min-w-[500px]">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        txn.type === 'withdrawal' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {txn.type === 'withdrawal' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{txn.description}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{txn.id} • {txn.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className={`font-mono font-semibold ${
                        txn.type === 'withdrawal' ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {txn.type === 'withdrawal' ? '-' : '+'}₹{txn.amount}
                      </span>
                      
                      {txn.status === 'success' ? (
                        <span className="inline-flex items-center text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> Cleared
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium border border-amber-100">
                          <Clock className="w-3 h-3 mr-1 text-amber-500" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 font-light">
                  No execution statements found in recent cycles.
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default WalletPayout;