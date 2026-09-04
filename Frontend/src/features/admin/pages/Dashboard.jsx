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

  const logout = async () => {
    await handleLogout();
    navigate("/login");
  };

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

  // 🥧 Format Distribution Data using Image Color Palette
  const statusDistributionData = useMemo(() => {
    return [
      { name: "Active", value: summary.activeAgents || 0, color: "#F59E0B" },    // Warm Orange Accent
      { name: "Inactive", value: summary.inactiveAgents || 0, color: "#EAB308" },  // Gold Accent
      { name: "Blocked", value: summary.blockedAgents || 0, color: "#DC2626" },   // Crimson Red Accent
    ].filter(item => item.value > 0);
  }, [summary]);

  // 🟢 Navigation Menu Items
  const navItems = [
    { id: "dashboard", label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { id: "agentList", label: "Agent List", path: "/admin/agentList", icon: Users, badge: summary.totalAgents },
    { id: "createProduct", label: "Create Product", path: "/admin/createProduct", icon: PackagePlus },
    { id: "inventory", label: "Inventory", path: "/admin/inventory", icon: Boxes },
    { id: "ManageFranchise", label: "ManageFranchise", path: "/admin/franchiseManageDashboard", icon: Boxes },
    { id: "agentPayout", label: "AgentPayout", path: "/admin/agentPayout", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4A4238] font-light flex">
      
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-[#36131C]/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* 🔴 Sidebar (Crimson Red Theme) */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-[#7F1D32] text-[#F9F3EA]
        flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 shadow-xl
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Header */}
        <div className="h-20 px-6 border-b border-[#9E2A43] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F59E0B] rounded-xl text-[#7F1D32] shadow-md">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-base leading-none tracking-wide">Shourya</h2>
              <span className="text-[10px] font-light tracking-widest text-[#FDE68A] uppercase">Enterprise</span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-1.5 text-[#F3E8FF] hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-4 space-y-1.5 overflow-y-auto flex-1">
          <p className="px-3 text-[10px] font-medium text-[#FCA5A5] uppercase tracking-widest mb-3 opacity-80">Main Menu</p>
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
                  w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-light transition cursor-pointer group
                  ${isActive 
                    ? "bg-[#F59E0B] text-[#5C1322] font-normal shadow-md" 
                    : "text-[#FDF8F3] hover:bg-[#9E2A43]/60 hover:text-white"}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-[#5C1322]" : "text-[#FDE68A] group-hover:text-white"}`} />
                  <span>{item.label}</span>
                </div>
                
                {item.badge !== undefined ? (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-normal ${isActive ? "bg-[#7F1D32] text-white" : "bg-[#9E2A43] text-[#FDE68A]"}`}>
                    {item.badge || 0}
                  </span>
                ) : (
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "hidden" : "block text-[#FDE68A]"}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-[#9E2A43] shrink-0">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#5C1322]/50 border border-[#9E2A43]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F59E0B] text-[#7F1D32] border border-[#FDE68A] flex items-center justify-center font-normal text-xs">
                AD
              </div>
              <div className="text-left">
                <p className="text-xs font-normal text-white leading-tight">Admin Console</p>
                <p className="text-[10px] font-light text-[#FDE68A]">Super Admin</p>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="text-[#FDE68A] hover:text-white p-1.5 rounded-lg hover:bg-[#9E2A43] transition cursor-pointer" 
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 md:ml-64 p-4 md:p-8">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6 pb-4 border-b border-[#E8DFC8]">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-white border border-[#E8DFC8] text-[#7F1D32] hover:bg-[#FAF7F2]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-normal text-[#7F1D32] text-sm">Shourya Admin</span>
          <div className="w-9" />
        </div>

        {/* Dashboard Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 mb-8 border-b border-[#E8DFC8] gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#D97706] font-normal text-xs tracking-wider uppercase mb-1">
              <Activity className="w-4 h-4" /> Real-Time Analytics
            </div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight text-[#36131C]">
              Agent Management Console
            </h1>
            <p className="text-[#786C5E] text-sm mt-0.5 font-light">
              Monitor system performance, user onboarding, and operational status.
            </p>
          </div>

          <button
            onClick={() => fetchDashboardData()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-white hover:bg-[#FAF7F2] active:scale-95 text-[#7F1D32] px-4 py-2.5 rounded-xl text-sm font-light transition shadow-sm border border-[#E8DFC8] disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#D97706]" : "text-[#7F1D32]"}`} />
            <span>{isLoading ? "Syncing..." : "Refresh Analytics"}</span>
          </button>
        </header>

        {/* Error Alert Banner */}
        {error && (
          <div className="mb-6 p-4 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl flex items-center justify-between text-[#991B1B]">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
              <span className="text-sm font-light">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-xs bg-white hover:bg-[#FEE2E2] text-[#991B1B] px-3 py-1 rounded-lg font-light transition border border-[#FCA5A5]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white border border-[#E8DFC8] rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-[#786C5E] text-xs font-light uppercase tracking-wider">Total Agents</span>
              <div className="p-2.5 bg-[#FEF3C7] text-[#D97706] rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-normal text-[#36131C]">
                {isLoading ? "..." : (summary.totalAgents || 0)}
              </h3>
              <p className="text-xs text-[#786C5E] mt-1 font-light">Registered platform users</p>
            </div>
          </div>

          <div className="bg-white border border-[#E8DFC8] rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-[#786C5E] text-xs font-light uppercase tracking-wider">Active Status</span>
              <div className="p-2.5 bg-[#FEF3C7] text-[#D97706] rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-normal text-[#36131C]">
                {isLoading ? "..." : (summary.activeAgents || 0)}
              </h3>
              <p className="text-xs text-[#D97706] mt-1 font-light flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> Operational
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E8DFC8] rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-[#786C5E] text-xs font-light uppercase tracking-wider">Inactive / Pending</span>
              <div className="p-2.5 bg-[#FEF9C3] text-[#CA8A04] rounded-xl">
                <UserMinus className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-normal text-[#36131C]">
                {isLoading ? "..." : (summary.inactiveAgents || 0)}
              </h3>
              <p className="text-xs text-[#CA8A04] mt-1 font-light">Requires review / dormant</p>
            </div>
          </div>

          <div className="bg-white border border-[#E8DFC8] rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-[#786C5E] text-xs font-light uppercase tracking-wider">Blocked Accounts</span>
              <div className="p-2.5 bg-[#FEE2E2] text-[#DC2626] rounded-xl">
                <UserX className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-normal text-[#36131C]">
                {isLoading ? "..." : (summary.blockedAgents || 0)}
              </h3>
              <p className="text-xs text-[#DC2626] mt-1 font-light flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Restricted access
              </p>
            </div>
          </div>
        </section>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white border border-[#E8DFC8] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-normal text-[#36131C] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#D97706]" /> Onboarding Growth Trajectory
                </h2>
                <p className="text-xs text-[#786C5E] font-light">Monthly new agent registrations over time</p>
              </div>
            </div>

            <div className="h-72 w-full">
              {isLoading ? (
                <div className="h-full w-full bg-[#FAF7F2] animate-pulse rounded-xl" />
              ) : formattedTrendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[#786C5E] text-sm font-light">
                  No trend metrics available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formattedTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="warmAmberGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DFC8" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#786C5E", fontWeight: 300 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#786C5E", fontWeight: 300 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E8DFC8", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }} />
                    <Area type="monotone" dataKey="Agents" stroke="#D97706" strokeWidth={2.5} fillOpacity={1} fill="url(#warmAmberGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#E8DFC8] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-normal text-[#36131C] flex items-center gap-2 mb-1">
                <PieIcon className="w-5 h-5 text-[#D97706]" /> Status Distribution
              </h2>
              <p className="text-xs text-[#786C5E] mb-4 font-light">Breakdown of current user base</p>

              <div className="h-56 w-full flex items-center justify-center">
                {isLoading ? (
                  <div className="h-44 w-44 rounded-full border-4 border-[#E8DFC8] border-t-[#D97706] animate-spin" />
                ) : statusDistributionData.length === 0 ? (
                  <div className="text-[#786C5E] text-sm font-light">No agent status data</div>
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
                      <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #E8DFC8" }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-white border border-[#E8DFC8] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-normal text-[#36131C]">Recently Onboarded Agents</h2>
              <p className="text-xs text-[#786C5E] font-light">Latest registration entries in the system</p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-10 bg-[#FAF7F2] animate-pulse rounded-lg" />
              ))}
            </div>
          ) : recentAgents.length === 0 ? (
            <div className="text-center py-10 text-[#786C5E] text-sm font-light">
              No recent agents recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8DFC8] text-[#786C5E] text-xs uppercase tracking-wider font-light">
                    <th className="pb-3 pl-2">Agent Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Assigned Role</th>
                    <th className="pb-3 text-right pr-2">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFE6] text-sm font-light">
                  {recentAgents.map((agent) => (
                    <tr key={agent._id} className="hover:bg-[#FAF7F2] transition">
                      <td className="py-3.5 pl-2 font-normal text-[#36131C]">{agent.fullName}</td>
                      <td className="py-3.5 text-[#786C5E]">{agent.email}</td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 text-xs bg-[#FAF7F2] text-[#786C5E] rounded-md font-light border border-[#E8DFC8]">
                          {agent.role || "Agent"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-light ${
                            agent.status === "Active"
                              ? "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]"
                              : agent.status === "Blocked"
                              ? "bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]"
                              : "bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A]"
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