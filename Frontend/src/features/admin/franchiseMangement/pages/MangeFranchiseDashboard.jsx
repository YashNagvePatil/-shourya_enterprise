import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAdminDashboard from "../hook/usefranchiseMangeDashboard";

const MangeFranchiseDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hook connectivity for real-time franchise data
  const {
    metrics = {},
    analytics = [],
    loading = { overview: false, analytics: false },
    error = null,
    fetchAllDashboardData,
  } = useAdminDashboard() || {};

  const {
    gmv = 0,
    totalOrders = 0,
    totalFranchises = 0,
    pendingApplications = 0,
    tierBreakdown = [],
  } = metrics;

  useEffect(() => {
    if (typeof fetchAllDashboardData === "function") {
      fetchAllDashboardData();
    }
  }, [fetchAllDashboardData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getMonthName = (monthNum) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return months[monthNum - 1] || `Month ${monthNum}`;
  };

  const isOverviewLoading = loading?.overview;
  const isAnalyticsLoading = loading?.analytics;
  const hasNoFranchises = !isOverviewLoading && totalFranchises === 0;

  const navItems = [
    {
      id: "franchiseSupply",
      label: "Franchise Supply",
      path: "/admin/manageFranchiseSupply",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: "outlets",
      label: "Franchise Outlets",
      path: "/admin/franchiseManageDashboard",
      badge: totalFranchises,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: "applications",
      label: "KYC Applications",
      path: "/admin/FranchiseVerifyKyc",
      badge: pendingApplications,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "paymentSettlement",
      label: "Payment Settlement",
      path: "/admin/manageFranchiseFinancials",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#FDFBF7] font-sans font-light text-[#4A3E3D]">
      {/* Scrollable Fixed Sidebar */}
      <aside className="sticky top-0 flex h-screen w-64 flex-col justify-between border-r border-[#F0E6D8] bg-white text-xs font-light">
        <div className="flex flex-col h-full min-h-0">
          {/* Brand Header */}
          <div className="flex items-center gap-3 p-6 border-b border-[#FAF6EE] shrink-0">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#D82348] text-white font-normal text-xs">
              F
            </span>
            <div>
              <h2 className="text-sm font-normal text-[#2C1E21] tracking-wide">Hub Portal</h2>
              <p className="text-[10px] font-light text-[#9A827A]">Franchise Ops</p>
            </div>
          </div>

          {/* Independently Scrollable Nav Items */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin scrollbar-thumb-[#F0E6D8]">
            <div className="mb-3 px-3 text-[10px] uppercase tracking-widest text-[#9A827A]">
              Navigation
            </div>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs transition ${
                    isActive
                      ? "bg-[#FAF6EE] text-[#D82348] font-normal shadow-2xs"
                      : "text-[#6E5D59] hover:bg-[#FAF8F7] hover:text-[#2C1E21]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-[#D82348]" : "text-[#9A827A] group-hover:text-[#2C1E21]"}>
                      {item.icon}
                    </span>
                    <span className="tracking-wide">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        isActive
                          ? "bg-[#D82348]/10 text-[#D82348]"
                          : "bg-[#FAF6EE] text-[#9A827A]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Connected Hook Status Bar */}
          <div className="p-4 border-t border-[#FAF6EE] bg-[#FAF8F7]/60 shrink-0">
            <div className="rounded-xl border border-[#F0E6D8] bg-white p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-light text-[#9A827A]">Hook Connection</span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-[#E2C275] animate-pulse"></span>
              </div>
              <p className="mt-1 text-[11px] font-normal text-[#2C1E21]">
                {isOverviewLoading || isAnalyticsLoading ? "Syncing Network..." : "Live Data Synced"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-6 md:p-10 overflow-y-auto">
        {/* Header Bar */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#F0E6D8] pb-5">
          <div>
            <h1 className="text-2xl font-light tracking-wide text-[#2C1E21] flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-[#D82348]"></span>
              Network Analytics
            </h1>
            <p className="text-xs font-light text-[#9A827A] mt-1">
              Real-time franchise performance and financial overview
            </p>
          </div>

          <button
            onClick={fetchAllDashboardData}
            disabled={isOverviewLoading || isAnalyticsLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2C275]/60 bg-white px-4 py-2 text-xs font-light tracking-wide text-[#9A1B32] shadow-sm transition hover:bg-[#F99834]/10 hover:border-[#F99834] active:bg-[#F99834]/20 disabled:opacity-50"
          >
            <svg
              className={`h-4 w-4 text-[#D82348] ${
                isOverviewLoading || isAnalyticsLoading ? "animate-spin" : ""
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
            Refresh Data
          </button>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-xl border border-[#D82348]/30 bg-[#D82348]/5 p-4 text-xs font-light text-[#D82348]">
            <span className="font-normal">Error:</span> {error}
          </div>
        )}

        {/* Empty State Banner */}
        {hasNoFranchises && (
          <div className="mb-8 rounded-2xl border border-[#F0E6D8] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F99834]/10 text-[#F99834] mb-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-sm font-normal text-[#2C1E21]">No Franchises Registered Yet</h3>
            <p className="mt-1 text-xs font-light text-[#9A827A] max-w-md mx-auto">
              There are currently no active franchise outlets or metrics recorded in the database.
            </p>
          </div>
        )}

        {/* Metrics Grid */}
        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#F0E6D8] bg-white p-5 shadow-sm transition hover:border-[#E2C275] hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-light uppercase tracking-widest text-[#9A827A]">
                Total GMV
              </span>
              <span className="rounded-full bg-[#D82348]/10 p-2 text-[#D82348]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="mt-3">
              {isOverviewLoading ? (
                <div className="h-7 w-32 animate-pulse rounded bg-[#FAF6EE]" />
              ) : (
                <h2 className="text-2xl font-light tracking-tight text-[#2C1E21]">
                  {formatCurrency(gmv)}
                </h2>
              )}
              <p className="mt-1 text-[11px] font-light text-[#9A827A]">Total settled revenue</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#F0E6D8] bg-white p-5 shadow-sm transition hover:border-[#E2C275] hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-light uppercase tracking-widest text-[#9A827A]">
                Total Orders
              </span>
              <span className="rounded-full bg-[#F99834]/15 p-2 text-[#F99834]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </span>
            </div>
            <div className="mt-3">
              {isOverviewLoading ? (
                <div className="h-7 w-20 animate-pulse rounded bg-[#FAF6EE]" />
              ) : (
                <h2 className="text-2xl font-light tracking-tight text-[#2C1E21]">
                  {(totalOrders || 0).toLocaleString()}
                </h2>
              )}
              <p className="mt-1 text-[11px] font-light text-[#9A827A]">Processed across network</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#F0E6D8] bg-white p-5 shadow-sm transition hover:border-[#E2C275] hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-light uppercase tracking-widest text-[#9A827A]">
                Active Outlets
              </span>
              <span className="rounded-full bg-[#E2C275]/25 p-2 text-[#B8943D]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </span>
            </div>
            <div className="mt-3">
              {isOverviewLoading ? (
                <div className="h-7 w-16 animate-pulse rounded bg-[#FAF6EE]" />
              ) : (
                <h2 className="text-2xl font-light tracking-tight text-[#2C1E21]">
                  {totalFranchises}
                </h2>
              )}
              <p className="mt-1 text-[11px] font-light text-[#9A827A]">Operational centers</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#F0E6D8] bg-white p-5 shadow-sm transition hover:border-[#E2C275] hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-light uppercase tracking-widest text-[#9A827A]">
                Pending KYC
              </span>
              <span className="rounded-full bg-[#D82348]/10 p-2 text-[#D82348]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
            </div>
            <div className="mt-3">
              {isOverviewLoading ? (
                <div className="h-7 w-16 animate-pulse rounded bg-[#FAF6EE]" />
              ) : (
                <h2 className="text-2xl font-light tracking-tight text-[#2C1E21]">
                  {pendingApplications}
                </h2>
              )}
              <p className="mt-1 text-[11px] font-light text-[#9A827A]">Applications awaiting review</p>
            </div>
          </div>
        </section>

        {/* Main Analytics Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#F0E6D8] bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 border-b border-[#F5EFE6] pb-4">
              <h3 className="text-sm font-normal text-[#2C1E21]">
                Monthly Performance Trends
              </h3>
              <p className="text-xs font-light text-[#9A827A] mt-0.5">
                Breakdown of revenue and order volumes by month
              </p>
            </div>

            {isAnalyticsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-10 w-full animate-pulse rounded bg-[#FAF6EE]" />
                ))}
              </div>
            ) : !analytics || analytics.length === 0 ? (
              <div className="py-12 text-center text-xs font-light text-[#9A827A]">
                No monthly performance data recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-light">
                  <thead>
                    <tr className="border-b border-[#F0E6D8] text-[#9A827A]">
                      <th className="pb-3 font-normal">Month</th>
                      <th className="pb-3 font-normal">Orders</th>
                      <th className="pb-3 text-right font-normal">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5EFE6]">
                    {analytics.map((item) => (
                      <tr key={item._id} className="transition hover:bg-[#FAF8F7]">
                        <td className="py-3.5 font-normal text-[#2C1E21]">
                          {getMonthName(item._id)}
                        </td>
                        <td className="py-3.5 text-[#6E5D59]">{item.orders || 0} orders</td>
                        <td className="py-3.5 text-right font-normal text-[#2C1E21]">
                          {formatCurrency(item.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#F0E6D8] bg-white p-6 shadow-sm">
            <div className="mb-6 border-b border-[#F5EFE6] pb-4">
              <h3 className="text-sm font-normal text-[#2C1E21]">
                Franchise Tier Distribution
              </h3>
              <p className="text-xs font-light text-[#9A827A] mt-0.5">
                Active hubs grouped by partnership tier
              </p>
            </div>

            {isOverviewLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-8 w-full animate-pulse rounded bg-[#FAF6EE]" />
                ))}
              </div>
            ) : !tierBreakdown || tierBreakdown.length === 0 ? (
              <div className="py-12 text-center text-xs font-light text-[#9A827A]">
                No tier breakdown data available.
              </div>
            ) : (
              <div className="space-y-4">
                {tierBreakdown.map((tier) => {
                  const count = tier?.count || 0;
                  const percentage = totalFranchises
                    ? Math.round((count / totalFranchises) * 100)
                    : 0;

                  return (
                    <div key={tier._id || Math.random()} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-light">
                        <span className="font-normal text-[#2C1E21]">
                          {tier._id || "Standard"} Tier
                        </span>
                        <span className="text-[#9A827A]">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#FAF6EE]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#D82348] via-[#F99834] to-[#E2C275] transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MangeFranchiseDashboard;