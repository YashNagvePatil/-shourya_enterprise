import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useFranchise } from "../hooks/useFranchise";
import { useFranchiseDashboard } from "../hooks/useFranchiseDashboard";

const FranchiseDashboard = () => {
  // Extract user authentication state
  const { currentFranchise } = useFranchise();
  const location = useLocation();

  // Active navigation tab highlight tracking
  const [activeTab, setActiveTab] = useState("dashboard");

  // Extract upgraded dashboard state and actions
  const {
    financials,
    metrics,
    analytics,
    dateFilter,
    loading,
    error,
    loadDashboardData,
    setDateFilter,
  } = useFranchiseDashboard();

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks-exhaustive-deps
  }, []);

  // Navigation Items Configuration
  const navItems = [
    {
      name: "Dashboard",
      path: "/franchise/dashboard",
      id: "dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Inventory",
      path: "/franchise/inventory",
      id: "inventory",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      name: "Supply Requests",
      path: "/franchise/supply",
      id: "supply",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      name: "Financials & Payouts",
      path: "/franchise/finance",
      id: "finance",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: "Payout Request",
      path: "/franchise/payoutRequest",
      id: "payoutRequest",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: "My Profile",
      path: "/franchise/profile",
      id: "profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-stone-50 font-light text-slate-700">
      {/* Fixed Left Navigation Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200/80 fixed h-full flex flex-col justify-between z-20">
        <div>
          {/* Brand Logo & Header */}
          <div className="p-6 border-b border-stone-100">
            <h2 className="text-lg font-normal tracking-wide text-slate-800 uppercase">
              Apex Franchise
            </h2>
            <p className="text-xs text-amber-600 mt-0.5 uppercase tracking-wider font-normal">
              {currentFranchise?.franchiseType || "DISTRICT"} PORTAL
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive =
                activeTab === item.id || location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm transition-all ${
                    isActive
                      ? "bg-amber-500 text-white font-normal shadow-md shadow-amber-500/20"
                      : "text-slate-500 hover:bg-stone-100 hover:text-slate-800"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account Footer Summary */}
        <Link 
          to="/franchise/profile"
          className="p-4 m-4 bg-stone-50 hover:bg-stone-100 transition-colors rounded-xl border border-stone-200/60 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-normal text-sm border border-amber-300">
            {currentFranchise?.fullName?.charAt(0) || "F"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-normal text-slate-800 truncate">
              {currentFranchise?.fullName || "Franchise Partner"}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {currentFranchise?.email || "branch@apex.com"}
            </p>
          </div>
        </Link>
      </aside>

      {/* Main Dashboard Content Wrapper */}
      <main className="flex-1 ml-64 p-8 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-stone-200/80 shadow-sm gap-4">
          <div>
            <h1 className="text-xl font-light text-slate-800">
              Welcome, {currentFranchise?.fullName || "Franchise Partner"}
            </h1>
            <p className="text-xs text-amber-600 font-normal mt-0.5 uppercase tracking-wider">
              {currentFranchise?.franchiseType || "DISTRICT"} LEVEL FRANCHISE
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Filter Selector */}
            <div className="flex bg-stone-100 p-1 rounded-lg text-xs font-normal">
              {["daily", "weekly", "monthly", "yearly"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`px-3 py-1 rounded-md capitalize transition-all ${
                    dateFilter === filter
                      ? "bg-white text-slate-800 shadow-sm font-medium"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-full">
              {currentFranchise?.status || "Account Active"}
            </span>
          </div>
        </div>

        {/* Active Pending Withdrawal Alert Banner */}
        {financials?.activePendingWithdrawal && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>
                You have an active withdrawal request of <strong>₹{financials.activePendingWithdrawal.amount?.toLocaleString()}</strong> currently under Admin review.
              </span>
            </div>
            <Link to="/franchise/finance" className="text-amber-700 underline font-medium hover:text-amber-900">
              View Status
            </Link>
          </div>
        )}

        {/* Error Alert Display */}
        {error && (
          <div className="p-4 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        {/* Wallet & Payout Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* Main Wallet Balance Highlight */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-700 shadow-md col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
            <div>
              <p className="text-[11px] uppercase text-amber-400 font-normal tracking-wider">
                Available Wallet Balance
              </p>
              <p className="text-3xl font-light mt-2 text-white">
                {loading ? "..." : `₹${financials?.walletBalance?.toLocaleString() || 0}`}
              </p>
            </div>
            <Link 
              to="/franchise/finance" 
              className="mt-4 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-normal py-2 px-3 rounded-lg text-center transition-all"
            >
              Withdraw Funds
            </Link>
          </div>

          {[
            {
              label: "Total Earnings",
              val: `₹${financials?.totalEarnings?.toLocaleString() || 0}`,
              color: "border-amber-400",
            },
            {
              label: "Total Commission",
              val: `₹${financials?.totalCommission?.toLocaleString() || 0}`,
              color: "border-yellow-500",
            },
            {
              label: "Pending Rent",
              val: `₹${financials?.pendingRent?.toLocaleString() || 0}`,
              color: "border-slate-300",
            },
            {
              label: "Pending ROI",
              val: `₹${financials?.pendingRoi?.toLocaleString() || 0}`,
              color: "border-stone-400",
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`bg-white p-5 rounded-xl border-l-4 ${card.color} border-y border-r border-stone-200/80 shadow-sm transition-transform hover:-translate-y-0.5 flex flex-col justify-between`}
            >
              <p className="text-xs uppercase text-slate-400 font-normal tracking-wider">
                {card.label}
              </p>
              <p className="text-2xl font-light text-slate-800 mt-2">
                {loading ? "..." : card.val}
              </p>
            </div>
          ))}
        </div>

        {/* Secondary Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-slate-400 font-normal tracking-wider">
                Active Supply Requests
              </p>
              <p className="text-3xl font-light text-slate-800 mt-1">
                {loading ? "..." : metrics?.activeSupplyRequests || 0}
              </p>
            </div>
            <Link to="/franchise/supply" className="p-3 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg text-xs font-medium border border-amber-200 transition-colors">
              Pending Action →
            </Link>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-slate-400 font-normal tracking-wider">
                Low Stock Alerts
              </p>
              <p className="text-3xl font-light text-slate-800 mt-1">
                {loading ? "..." : metrics?.lowStockAlerts || 0}
              </p>
            </div>
            <Link to="/franchise/inventory" className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-medium border border-rose-200 transition-colors">
              Inventory Warning →
            </Link>
          </div>
        </div>

        {/* Analytics Visualizer Chart */}
        <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-normal text-slate-700">
              Earnings & Throughput Analytics
            </h2>
            <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 capitalize">
              {dateFilter} View
            </span>
          </div>

          {/* Dynamic Bar Chart Visualizer */}
          <div className="h-64 flex items-end justify-between gap-4 pt-8 px-4 border-b border-slate-100 relative">
            {loading ? (
              <div className="w-full flex justify-center items-center h-full text-xs text-slate-400">
                Loading analytics...
              </div>
            ) : analytics && analytics.length > 0 ? (
              analytics.map((bar, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer relative"
                >
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow pointer-events-none z-10 whitespace-nowrap">
                    ₹{bar.amount?.toLocaleString() || 0}
                  </div>

                  {/* Dynamic Height Bar */}
                  <div
                    style={{ height: bar.heightPercentage || "5%" }}
                    className="w-full max-w-[36px] bg-gradient-to-t from-amber-500 to-yellow-400 rounded-t transition-all group-hover:brightness-110"
                  />
                  <span className="text-xs text-slate-400 font-light">
                    {bar.label}
                  </span>
                </div>
              ))
            ) : (
              <div className="w-full flex justify-center items-center h-full text-xs text-slate-400">
                No analytics data available for selected filter.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FranchiseDashboard;