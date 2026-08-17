import React from "react";
import { useFetchDashboard } from "../hook/useAgent";

import { 
  Wallet, 
  Users, 
  TrendingUp, 
  GitBranch, 
  RefreshCw, 
  ArrowUpRight, 
  ShieldCheck, 
  CreditCard,
  UserCheck,
  ChevronRight
} from "lucide-react";

const Dashboard = () => {
  const {
    profile,
    wallet,
    binaryStats,
    recentDownlines,
    loading,
    error,
    refetchDashboard,
  } = useFetchDashboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-light">
        <div className="flex items-center space-x-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200/80">
          <RefreshCw className="w-5 h-5 animate-spin text-sky-600" />
          <span className="tracking-wide text-sm font-normal text-slate-700">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-rose-200 rounded-2xl p-6 text-center max-w-md shadow-sm">
          <p className="text-rose-600 text-sm font-light mb-4">{error}</p>
          <button
            onClick={refetchDashboard}
            className="px-5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 text-xs font-medium transition cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. TOP HEADER (LIGHT CARD) */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-lg font-light text-sky-600">
              {profile?.fullName?.charAt(0) || "A"}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-light tracking-tight text-slate-900">
                  Welcome, <span className="font-normal text-sky-600">{profile?.fullName || "Agent"}</span>
                </h1>
                <span className="px-2.5 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  {profile?.status || "Active"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-light mt-1">
                ID: <span className="text-slate-700 font-mono font-normal">{profile?.distributerId || "N/A"}</span> • Rank: <span className="text-slate-700 font-normal">{profile?.rank || "Distributor"}</span>
              </p>
            </div>
          </div>

          <button
            onClick={refetchDashboard}
            className="self-start md:self-auto flex items-center space-x-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 text-xs font-light transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh Data</span>
          </button>
        </header>

        {/* 2. STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Main Wallet */}
          <div className="bg-white border border-slate-200/80 hover:border-sky-300 p-5 rounded-2xl transition-all shadow-sm group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-normal text-slate-500">Main Wallet</span>
              <div className="p-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100 group-hover:bg-sky-600 group-hover:text-white transition">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-light text-slate-900 tracking-tight">
                ₹{wallet?.walletBalance?.toLocaleString() || "0"}
              </h3>
              <p className="text-[11px] text-slate-500 font-light mt-1 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                Available for withdrawal
              </p>
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-white border border-slate-200/80 hover:border-emerald-300 p-5 rounded-2xl transition-all shadow-sm group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-normal text-slate-500">Total Earnings</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-light text-slate-900 tracking-tight">
                ₹{wallet?.totalEarning?.toLocaleString() || "0"}
              </h3>
              <p className="text-[11px] text-emerald-600 font-light mt-1 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                Lifetime revenue
              </p>
            </div>
          </div>

          {/* Direct Downlines */}
          <div className="bg-white border border-slate-200/80 hover:border-purple-300 p-5 rounded-2xl transition-all shadow-sm group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-normal text-slate-500">Direct Referrals</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-light text-slate-900 tracking-tight">
                {binaryStats?.totalDirects || 0}
              </h3>
              <p className="text-[11px] text-slate-500 font-light mt-1">
                Active team builders
              </p>
            </div>
          </div>

          {/* Matching Bonus */}
          <div className="bg-white border border-slate-200/80 hover:border-amber-300 p-5 rounded-2xl transition-all shadow-sm group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-normal text-slate-500">Matching Bonus</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 group-hover:bg-amber-600 group-hover:text-white transition">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-light text-slate-900 tracking-tight">
                ₹{wallet?.totalMatchingBonus?.toLocaleString() || "0"}
              </h3>
              <p className="text-[11px] text-amber-700 font-light mt-1">
                Binary income accumulated
              </p>
            </div>
          </div>
        </div>

        {/* 3. BINARY LEGS PROGRESS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-sky-600" />
              <h2 className="text-base font-normal text-slate-800">Binary Leg Performance</h2>
            </div>
            <span className="text-xs text-slate-400 font-light">Business Volume (BV)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Leg */}
            <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/60">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-sky-700">Left Leg</span>
                <span className="text-xs text-slate-500 font-light">Agents: {binaryStats?.leftLeg?.totalAgents || 0}</span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xl font-light text-slate-900">{binaryStats?.leftLeg?.currentBV || 0} <span className="text-xs text-slate-500 font-light">BV</span></span>
              </div>
              <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((binaryStats?.leftLeg?.currentBV || 0) / 10000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Right Leg */}
            <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/60">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-purple-700">Right Leg</span>
                <span className="text-xs text-slate-500 font-light">Agents: {binaryStats?.rightLeg?.totalAgents || 0}</span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xl font-light text-slate-900">{binaryStats?.rightLeg?.currentBV || 0} <span className="text-xs text-slate-500 font-light">BV</span></span>
              </div>
              <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((binaryStats?.rightLeg?.currentBV || 0) / 10000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. RECENT DOWNLINES TABLE */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-normal text-slate-800">Recent Downline Registrations</h2>
            <button className="text-xs text-sky-600 hover:text-sky-700 font-normal flex items-center cursor-pointer">
              View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 font-normal">Member</th>
                  <th className="py-3 px-4 font-normal">Distributor ID</th>
                  <th className="py-3 px-4 font-normal">Leg Position</th>
                  <th className="py-3 px-4 font-normal">Join Date</th>
                  <th className="py-3 px-4 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDownlines && recentDownlines.length > 0 ? (
                  recentDownlines.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-normal text-slate-800 flex items-center space-x-2">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.fullName}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{item.distributerId}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          item.position === "Left" ? "bg-sky-50 text-sky-700 border border-sky-100" : "bg-purple-50 text-purple-700 border border-purple-100"
                        }`}>
                          {item.position} Leg
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{item.createdAt || "Recently"}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center text-[11px] text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Active
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 font-light">
                      No recent downlines found.
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

export default Dashboard;