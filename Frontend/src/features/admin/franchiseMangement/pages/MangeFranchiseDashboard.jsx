import React, { useEffect } from "react";
import useAdminDashboard from "../hook/usefranchiseMangeDashboard";

const MangeFranchiseDashboard = () => {
  // Safe destructuring with fallback defaults
  const {
    metrics = {},
    analytics = [],
    loading = { overview: false, analytics: false },
    error = null,
    fetchAllDashboardData,
  } = useAdminDashboard() || {};

  // Safely extract metric properties with defaults
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

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-10 font-sans font-light text-[#4A3E3D]">
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

      {/* No Data / Empty State Banner */}
      {hasNoFranchises && (
        <div className="mb-8 rounded-2xl border border-[#F0E6D8] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F99834]/10 text-[#F99834] mb-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-sm font-normal text-[#2C1E21]">No Franchises Registered Yet</h3>
          <p className="mt-1 text-xs font-light text-[#9A827A] max-w-md mx-auto">
            There are currently no active franchise outlets or metrics recorded in the database. Metrics will automatically update once franchises are onboarded.
          </p>
        </div>
      )}

      {/* Metrics Grid */}
      <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric Card 1: Gross Merchandise Value */}
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

        {/* Metric Card 2: Total Network Orders */}
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

        {/* Metric Card 3: Active Franchises */}
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

        {/* Metric Card 4: Pending Onboarding Applications */}
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
        {/* Monthly Revenue & Order Performance Table */}
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

        {/* Tier Distribution Breakdown */}
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
    </div>
  );
};

export default MangeFranchiseDashboard;