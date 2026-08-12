import React, { useState } from "react";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  DollarSign, 
  ArrowRight,
  TrendingUp
} from "lucide-react";

// STATIC DATA FOR TRANSACTIONS
const STATIC_TRANSACTIONS = [
  { id: "TXN-9081", type: "commission", amount: 4500, description: "Binary Matching Bonus (Cycle #42)", date: "12 Aug 2026", status: "success" },
  { id: "TXN-9052", type: "referral", amount: 1500, description: "Direct Referral Bonus - Rahul Sharma", date: "10 Aug 2026", status: "success" },
  { id: "TXN-8941", type: "withdrawal", amount: 5000, description: "Payout to HDFC Bank (****4321)", date: "05 Aug 2026", status: "success" },
  { id: "TXN-8812", type: "commission", amount: 3200, description: "Level 2 Team Performance Bonus", date: "01 Aug 2026", status: "success" },
  { id: "TXN-8700", type: "withdrawal", amount: 2500, description: "Payout to HDFC Bank (****4321)", date: "28 Jul 2026", status: "pending" },
];

const WalletPayout = () => {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const balance = 8750; // Static Available Balance

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    alert(`Static UI Demo: Withdrawal request raised for ₹${withdrawAmount}`);
    setWithdrawAmount("");
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Wallet & Payout Ledger</h1>
          <p className="text-xs text-slate-500">Manage your earnings, bonuses, and instantly withdraw nodes settlement.</p>
        </div>

        {/* STATS MATRIX */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Available Balance</span>
              <span className="text-2xl font-bold text-slate-900">₹{balance.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Total Earnings</span>
              <span className="text-2xl font-bold text-slate-900">₹42,950</span>
            </div>
            <div className="p-3 rounded-lg bg-sky-50 text-sky-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Total Withdrawn</span>
              <span className="text-2xl font-bold text-slate-900">₹34,200</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-100 text-slate-600">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {/* LEFT: WITHDRAWAL FORM */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Building2 className="w-4 h-4 text-slate-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Request Settlement</h2>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500 block">Select Destination Vault</label>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">HDFC Bank Ltd</span>
                    <span className="text-slate-400 font-mono text-[10px]">Account: ********4321</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-medium">Verified</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500 block">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-medium">₹</span>
                  <input 
                    type="number"
                    max={balance}
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full text-xs pl-7 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 font-mono"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 block font-light">Minimum withdrawal: ₹500</span>
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition active:scale-98 flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
              >
                <span>Initiate Payout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* RIGHT: TRANSACTION HISTORY */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] md:col-span-2 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Transaction History</h2>
              </div>
              <span className="text-[10px] text-slate-400 font-light">Showing latest logs</span>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {STATIC_TRANSACTIONS.map((txn) => (
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
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WalletPayout;