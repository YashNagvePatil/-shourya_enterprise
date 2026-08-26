import React, { useEffect } from "react";
import { useFranchise } from "../hooks/useFranchise";
import { getFinancialOverview } from "../services/franchiseApi";

 const FranchiseDashboard = () => {
  const { user, financials, handleSetFinancials } = useFranchise();

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await getFinancialOverview();
        if (res.success) handleSetFinancials(res.financials);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };
    fetchOverview();
  }, []);

  return (
    <div className="p-8 bg-stone-50 min-h-screen font-light text-slate-700 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-stone-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-light text-slate-800">Welcome, {user?.fullName || "Franchise Partner"}</h1>
          <p className="text-xs text-amber-600 font-normal mt-0.5">{user?.franchiseType || "DISTRICT"} LEVEL FRANCHISE</p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-full">
          Account Active
        </span>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { label: "Total Earnings", val: `₹${financials.totalEarnings || 0}`, color: "border-amber-400" },
          { label: "Total Commission", val: `₹${financials.totalCommission || 0}`, color: "border-yellow-500" },
          { label: "Pending Rent", val: `₹${financials.pendingRent || 0}`, color: "border-slate-300" },
          { label: "Pending ROI", val: `₹${financials.pendingRoi || 0}`, color: "border-stone-400" },
        ].map((card, i) => (
          <div key={i} className={`bg-white p-5 rounded-xl border-l-4 ${card.color} border-y border-r border-stone-200/80 shadow-sm`}>
            <p className="text-xs uppercase text-slate-400 font-normal tracking-wider">{card.label}</p>
            <p className="text-2xl font-light text-slate-800 mt-2">{card.val}</p>
          </div>
        ))}
      </div>

      {/* Analytics Graph Visualizer */}
      <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-normal text-slate-700">Monthly Earnings & Supply Throughput</h2>
          <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">Current Year</span>
        </div>
        
        {/* Modern Bar Chart Component */}
        <div className="h-64 flex items-end justify-between gap-4 pt-8 px-4 border-b border-slate-100">
          {[
            { month: "Jan", height: "40%" },
            { month: "Feb", height: "55%" },
            { month: "Mar", height: "35%" },
            { month: "Apr", height: "70%" },
            { month: "May", height: "85%" },
            { month: "Jun", height: "60%" },
            { month: "Jul", height: "90%" },
          ].map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div 
                style={{ height: bar.height }} 
                className="w-full max-w-[36px] bg-gradient-to-t from-amber-500 to-yellow-400 rounded-t transition-all group-hover:brightness-110"
              />
              <span className="text-xs text-slate-400 font-light">{bar.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FranchiseDashboard