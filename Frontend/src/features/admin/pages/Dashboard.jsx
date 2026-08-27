import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAdmin } from "../hook/useAdmin.js";
import { useAuth } from "../../auth/hook/useAuth.js";
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserMinus, 
  RefreshCw, 
  AlertCircle, 
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  LayoutDashboard,
  PackagePlus,
  Boxes,
  Menu,
  X,
  LogOut,
  ChevronRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogout } = useAuth();

 const logout = async () =>{
   await  handleLogout()
   navigate("/login")
 }

  const { 
    summary = {}, 
    recentAgents = [], 
    monthlyTrend = [], 
    isLoading, 
    error, 
    fetchDashboardData, 
    clearError 
  } = useAdmin();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 📈 Format Trend Data for Area Chart
  const formattedTrendData = useMemo(() => {
    return monthlyTrend.map((item) => ({
      month: `${item._id?.month}/${item._id?.year}`,
      Agents: item.count || 0
    }));
  }, [monthlyTrend]);

  // 🥧 Format Distribution Data for Pie Chart
  const statusDistributionData = useMemo(() => {
    return [
      { name: "Active", value: summary.activeAgents || 0, color: "#10B981" },
      { name: "Inactive", value: summary.inactiveAgents || 0, color: "#F59E0B" },
      { name: "Blocked", value: summary.blockedAgents || 0, color: "#EF4444" },
    ].filter(item => item.value > 0);
  }, [summary]);

  // 🟢 Navigation Menu Items
  const navItems = [
    { id: "dashboard", label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { id: "agentList", label: "Agent List", path: "/admin/agentList", icon: Users, badge: summary.totalAgents },
    { id: "createProduct", label: "Create Product", path: "/admin/createProduct", icon: PackagePlus },
    { id: "inventory", label: "Inventory", path: "/admin/inventory", icon: Boxes },
    { id: "ManageFranchise", label: "ManageFranchise", path: "/admin/franchiseManageDashboard", icon: Boxes },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex">
      
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* 🟢 Strictly Fixed Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-300
        flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 shadow-xl
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Header (Non-scrolling) */}
        <div className="h-20 px-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-none">Shourya</h2>
              <span className="text-[10px] font-semibold tracking-wider text-indigo-400 uppercase">Enterprise</span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links (Internally Scrollable if viewport height is small) */}
        <div className="p-4 space-y-1.5 overflow-y-auto flex-1">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Main Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition cursor-pointer group
                  ${isActive 
                    ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30" 
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                  <span>{item.label}</span>
                </div>
                
                {item.badge !== undefined ? (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}`}>
                    {item.badge || 0}
                  </span>
                ) : (
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "hidden" : "block text-slate-500"}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile & Logout Footer (Non-scrolling pin to bottom) */}
        <div className="p-4 border-t border-slate-800/80 shrink-0">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                AD
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">Admin Console</p>
                <p className="text-[10px] text-slate-400">Super Admin</p>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer" 
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 🟢 Main Dashboard Content Area (Margin-Left Added for Desktop offset) */}
      <main className="flex-1 min-w-0 md:ml-64 p-4 md:p-8">
        
        {/* Mobile Top Header Bar */}
        <div className="md:hidden flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-900 text-sm">Shourya Admin</span>
          <div className="w-9" />
        </div>

        {/* Dashboard Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
              <Activity className="w-4 h-4" /> Real-Time Analytics
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Agent Management Console
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Monitor system performance, user onboarding, and operational status.
            </p>
          </div>

          <button
            onClick={() => fetchDashboardData()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 active:scale-95 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm border border-slate-200 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
            <span>{isLoading ? "Syncing..." : "Refresh Analytics"}</span>
          </button>
        </header>

        {/* Error Alert Banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-xs bg-rose-100 hover:bg-rose-200 text-rose-700 px-3 py-1 rounded-lg font-medium transition"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Agents</span>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-900">
                {isLoading ? "..." : (summary.totalAgents || 0)}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Registered platform users</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Active Status</span>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-900">
                {isLoading ? "..." : (summary.activeAgents || 0)}
              </h3>
              <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> Operational
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Inactive / Pending</span>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <UserMinus className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-900">
                {isLoading ? "..." : (summary.inactiveAgents || 0)}
              </h3>
              <p className="text-xs text-amber-600 mt-1 font-medium">Requires review / dormant</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Blocked Accounts</span>
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                <UserX className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-900">
                {isLoading ? "..." : (summary.blockedAgents || 0)}
              </h3>
              <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Restricted access
              </p>
            </div>
          </div>
        </section>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" /> Onboarding Growth Trajectory
                </h2>
                <p className="text-xs text-slate-500">Monthly new agent registrations over time</p>
              </div>
            </div>

            <div className="h-72 w-full">
              {isLoading ? (
                <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl" />
              ) : formattedTrendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No trend metrics available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formattedTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
                    <Area type="monotone" dataKey="Agents" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#indigoGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                <PieIcon className="w-5 h-5 text-indigo-600" /> Status Distribution
              </h2>
              <p className="text-xs text-slate-500 mb-4">Breakdown of current user base</p>

              <div className="h-56 w-full flex items-center justify-center">
                {isLoading ? (
                  <div className="h-44 w-44 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
                ) : statusDistributionData.length === 0 ? (
                  <div className="text-slate-400 text-sm">No agent status data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #E2E8F0" }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recently Onboarded Agents</h2>
              <p className="text-xs text-slate-500">Latest registration entries in the system</p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-10 bg-slate-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : recentAgents.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No recent agents recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="pb-3 pl-2">Agent Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Assigned Role</th>
                    <th className="pb-3 text-right pr-2">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {recentAgents.map((agent) => (
                    <tr key={agent._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 pl-2 font-semibold text-slate-900">{agent.fullName}</td>
                      <td className="py-3.5 text-slate-600">{agent.email}</td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-md font-medium border border-slate-200">
                          {agent.role || "Agent"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            agent.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : agent.status === "Blocked"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {agent.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;