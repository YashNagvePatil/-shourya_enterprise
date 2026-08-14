import React, { useState } from "react";

export const AdminDashboard = () => {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("7d");
  const [systemAlertThreshold, setSystemAlertThreshold] = useState(90);
  const [searchQuery, setSearchQuery] = useState("");

  // Static Analytical Data Sets
  const systemMetrics = [
    { label: "Total Platform Volume", value: "$1,482,900.00", change: "+12.4% MoM", status: "optimal" },
    { label: "Active Nodes Operational", value: "14,284 / 15,000", change: "95.2% Capacity", status: "stable" },
    { label: "Pending KYC Pipeline", value: "412 Accounts", change: "-8% Queue Depth", status: "warning" },
    { label: "Network Synchronization", value: "99.98% Sync", change: "1.2s Avg Block Time", status: "optimal" }
  ];

  const distributionLogs = [
    { id: "TXN-9081", agent: "Alpha Distributor", region: "North Core", volume: "$12,450.00", type: "Binary Match", status: "Settled", date: "2026-08-13" },
    { id: "TXN-9080", agent: "Quantum Logistics", region: "West Perimeter", volume: "$8,900.00", type: "Direct Referal", status: "Settled", date: "2026-08-13" },
    { id: "TXN-9079", agent: "Apex Alliance", region: "South Sector", volume: "$24,150.00", type: "Franchise Bonus", status: "Pending Verification", date: "2026-08-12" },
    { id: "TXN-9078", agent: "Vanguard Hub", region: "East Terminal", volume: "$4,200.00", type: "Binary Match", status: "Settled", date: "2026-08-12" },
    { id: "TXN-9077", agent: "Prime Horizon", region: "North Core", volume: "$16,800.00", type: "Override Commission", status: "Flagged Tier Audit", date: "2026-08-11" }
  ];

  const filteredLogs = distributionLogs.filter(log => 
    log.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex overflow-hidden">
      
      {/* ================= SIDEBAR NAVIGATION ================= */}
      <aside className="w-64 bg-slate-950 text-white hidden md:flex flex-col justify-between p-6 border-r border-slate-800 shrink-0">
        <div>
          {/* Brand Heading */}
          <div className="flex items-center gap-2 px-2 py-3 border-b border-white/10 mb-6">
            <span className="w-3 h-3 rounded-full bg-slate-400 animate-pulse"></span>
            <span className="font-semibold text-sm tracking-wide uppercase text-slate-200">System Kernel v4.2</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: "overview", label: "Operations Control", icon: "■" },
              { id: "nodes", label: "Distribution Topology", icon: "☲" },
              { id: "financials", label: "Settlement Ledgers", icon: "⚖" },
              { id: "compliance", label: "KYC / Audit Vault", icon: "⎔" },
              { id: "settings", label: "System Parameter Rules", icon: "⚙" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === item.id 
                    ? "bg-white text-slate-950 shadow-md font-semibold" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-sm leading-none">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User Identity Segment */}
        <div className="pt-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-xs font-bold text-slate-300">
            AD
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Root Administrator</h4>
            <p className="text-[10px] text-slate-400">Secured Instance Session</p>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT SURFACE ================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold tracking-tight uppercase text-slate-800">
              {activeTab.replace("-", " ")} Workspace
            </h2>
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-600">
              STATUS: <span className="text-emerald-600 font-bold">ONLINE</span>
            </div>
          </div>

          {/* Context Controls */}
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-500 cursor-pointer"
            >
              <option value="24h">Metrics: Last 24 Hours</option>
              <option value="7d">Metrics: Last 7 Days</option>
              <option value="30d">Metrics: Last 30 Days</option>
            </select>
          </div>
        </header>

        {/* Dashboard Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* ================= METRIC SUMMARY ROW ================= */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {systemMetrics.map((metric, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block mb-1">
                    {metric.label}
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                    {metric.value}
                  </h3>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-600">{metric.change}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    metric.status === "optimal" ? "bg-emerald-500" :
                    metric.status === "stable" ? "bg-slate-500" : "bg-amber-500"
                  }`} />
                </div>
              </div>
            ))}
          </section>

          {/* ================= INTERACTIVE WORKSPACE SPLIT ================= */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* System Controls & Config Panel (4 Columns) */}
            <div className="xl:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                  Threshold Controls
                </h3>
                <p className="text-[11px] text-slate-500">
                  Dynamically isolate nodes operating beyond safe capacities.
                </p>
              </div>

              {/* Slider Control */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">Anomaly Isolation Target</span>
                  <span className="font-mono font-bold text-slate-900">{systemAlertThreshold}% Capacity</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="99"
                  value={systemAlertThreshold}
                  onChange={(e) => setSystemAlertThreshold(Number(e.target.value))}
                  className="w-full accent-slate-800 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>70% Minimum Limit</span>
                  <span>99% Rigid Absolute</span>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Functional Process Blueprint Actions */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-700">
                  Critical Operations Flow
                </h4>
                <div className="space-y-1.5">
                  <button className="w-full text-left p-2.5 bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-lg text-xs transition-all flex items-center justify-between group cursor-pointer">
                    <div>
                      <p className="font-semibold text-slate-800">Lock Ingestion Pools</p>
                      <p className="text-[10px] text-slate-400">Halts real-time database state mutations</p>
                    </div>
                    <span className="text-slate-400 group-hover:text-slate-900 font-bold">→</span>
                  </button>
                  <button className="w-full text-left p-2.5 bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-lg text-xs transition-all flex items-center justify-between group cursor-pointer">
                    <div>
                      <p className="font-semibold text-slate-800">Trigger Topology Audit</p>
                      <p className="text-[10px] text-slate-400">Verifies binary nodes matching structures</p>
                    </div>
                    <span className="text-slate-400 group-hover:text-slate-900 font-bold">→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Data Grid Table Ledger (8 Columns) */}
            <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              {/* Data Filtering Bar */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Real-time Transaction Ledger
                  </h3>
                  <p className="text-[11px] text-slate-500">System distribution events log grid.</p>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Node ID, Partner, or Category..."
                    className="w-full sm:w-64 pl-3 pr-8 py-1 bg-white rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-500 transition-all"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">⌕</span>
                </div>
              </div>

              {/* Tabular Responsive Segment */}
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="p-3 pl-4">Audit ID</th>
                      <th className="p-3">Distributor Entity</th>
                      <th className="p-3">Type</th>
                      <th className="p-3 text-right">Settlement</th>
                      <th className="p-3 pr-4 text-center">Engine Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 pl-4 font-mono font-semibold text-slate-600">{log.id}</td>
                          <td className="p-3">
                            <p className="font-semibold text-slate-900">{log.agent}</p>
                            <p className="text-[10px] text-slate-400">{log.region} • {log.date}</p>
                          </td>
                          <td className="p-3 font-medium text-slate-600">{log.type}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">{log.volume}</td>
                          <td className="p-3 pr-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase border ${
                              log.status === "Settled" 
                                ? "bg-slate-50 border-slate-300 text-slate-800"
                                : log.status.includes("Flagged")
                                ? "bg-red-50 border-red-200 text-red-700"
                                : "bg-amber-50 border-amber-200 text-amber-700"
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-xs text-slate-400 font-medium">
                          No internal distribution logs match your system search query parameters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </section>

        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;