import React, { useState } from "react";
import { useFetchDashboard } from "../hook/useAgent";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/hook/useAuth";
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
  ChevronRight,
  LayoutDashboard,
  User,
  Network,
  Menu,
  X,
  LogOut
} from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { handleLogout } = useAuth();
  const {
    profile,
    wallet,
    binaryStats,
    recentDownlines,
    loading,
    error,
    refetchDashboard,
  } = useFetchDashboard();

  // Logout Handler
  const handlelogout = async () => {
    await handleLogout();
    navigate("/login");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", path: "/agent/dashboard", icon: LayoutDashboard },
    { id: "network", label: "Network", path: "/agent/network", icon: Network },
    { id: "profile", label: "Profile", path: "/agent/profile", icon: User },
    { id: "wallet", label: "Wallet", path: "/agent/wallet", icon: Wallet },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center text-slate-500 font-light">
        <div className="flex items-center space-x-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-[#E0C475]/40">
          <RefreshCw className="w-5 h-5 animate-spin text-[#DC2643]" />
          <span className="tracking-wide text-sm font-light text-slate-700">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center p-4">
        <div className="bg-white border border-[#DC2643]/30 rounded-2xl p-6 text-center max-w-md shadow-sm">
          <p className="text-[#DC2643] text-sm font-light mb-4">{error}</p>
          <button
            onClick={refetchDashboard}
            className="px-5 py-2 bg-[#DC2643]/10 hover:bg-[#DC2643]/20 text-[#DC2643] rounded-xl border border-[#DC2643]/30 text-xs font-light transition cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF5EE] text-slate-800 font-light flex">

      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* 1. LEFT SIDEBAR (z-40) */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-[#E0C475]/40 z-40 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Logo / Title */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-[#FAF5EE]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#DC2643] flex items-center justify-center text-white font-light text-sm shadow-sm">
                A
              </div>
              <span className="font-light text-slate-800 tracking-tight text-base">Agent Portal</span>
            </div>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                    navigate(item.path);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-light transition cursor-pointer ${
                    isActive
                      ? "bg-[#DC2643]/10 text-[#DC2643] border border-[#DC2643]/20 shadow-xs"
                      : "text-slate-600 hover:bg-[#FAF5EE] hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#DC2643]" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Agent Info + Logout Icon */}
        <div className="p-3 border-t border-[#FAF5EE] flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 p-2 bg-[#FAF5EE]/60 rounded-xl border border-[#E0C475]/30 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#DC2643]/10 text-[#DC2643] flex items-center justify-center text-xs font-light shrink-0">
              {profile?.fullName?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-light text-slate-800 truncate">{profile?.fullName || "Agent"}</p>
              <p className="text-[10px] text-slate-400 truncate font-mono font-light">{profile?.distributerId || "N/A"}</p>
            </div>
          </div>

          {/* 🔴 LOGOUT ICON BUTTON */}
          <button
            onClick={handlelogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-[#DC2643] hover:bg-[#DC2643]/10 rounded-xl border border-slate-200/60 hover:border-[#DC2643]/30 transition cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">

        {/* MOBILE TOP BAR TOGGLE */}
        <div className="lg:hidden bg-white border-b border-[#E0C475]/40 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-[#FAF5EE] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-light text-sm text-slate-800">Agent Portal</span>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-light bg-[#F59E35]/15 text-[#F59E35] rounded-full border border-[#F59E35]/30">
            {profile?.status || "Active"}
          </span>
        </div>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-5">

          {/* TOP HEADER */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E0C475]/40 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 rounded-xl bg-[#DC2643]/10 border border-[#DC2643]/20 flex items-center justify-center text-base font-light text-[#DC2643] shrink-0">
                {profile?.fullName?.charAt(0) || "A"}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg sm:text-xl font-light tracking-tight text-slate-900">
                    Welcome back, <span className="font-light text-[#DC2643]">{profile?.fullName || "Agent"}</span>
                  </h1>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-light bg-[#F59E35]/15 text-[#F59E35] border border-[#F59E35]/30 rounded-full">
                    {profile?.status || "Active"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-light mt-0.5">
                  ID: <span className="text-slate-700 font-mono font-light">{profile?.distributerId || "N/A"}</span> • Rank: <span className="text-slate-700 font-light">{profile?.rank || "Distributor"}</span>
                </p>
              </div>
            </div>

            <button
              onClick={refetchDashboard}
              className="self-start md:self-auto flex items-center space-x-1.5 px-3 py-1.5 bg-[#FAF5EE] hover:bg-[#E0C475]/20 text-slate-600 rounded-xl border border-[#E0C475]/40 text-xs font-light transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Refresh Data</span>
            </button>
          </header>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white border border-[#E0C475]/40 hover:border-[#DC2643]/40 p-3.5 sm:p-4 rounded-xl transition-all shadow-xs group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-light text-slate-500">Main Wallet</span>
                <div className="p-1.5 bg-[#DC2643]/10 text-[#DC2643] rounded-lg border border-[#DC2643]/20 group-hover:bg-[#DC2643] group-hover:text-white transition">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-lg sm:text-xl font-light text-slate-900 tracking-tight">
                  ₹{wallet?.walletBalance?.toLocaleString() || "0"}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-light mt-0.5 flex items-center">
                  <ShieldCheck className="w-3 h-3 text-[#F59E35] mr-1 shrink-0" />
                  Available for withdrawal
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#E0C475]/40 hover:border-[#F59E35]/40 p-3.5 sm:p-4 rounded-xl transition-all shadow-xs group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-light text-slate-500">Total Earnings</span>
                <div className="p-1.5 bg-[#F59E35]/10 text-[#F59E35] rounded-lg border border-[#F59E35]/20 group-hover:bg-[#F59E35] group-hover:text-white transition">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-lg sm:text-xl font-light text-slate-900 tracking-tight">
                  ₹{wallet?.totalEarning?.toLocaleString() || "0"}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-[#F59E35] font-light mt-0.5 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-0.5 shrink-0" />
                  Lifetime revenue
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#E0C475]/40 hover:border-[#E0C475] p-3.5 sm:p-4 rounded-xl transition-all shadow-xs group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-light text-slate-500">Direct Referrals</span>
                <div className="p-1.5 bg-[#E0C475]/20 text-[#slate-700] rounded-lg border border-[#E0C475]/30 group-hover:bg-[#E0C475] group-hover:text-slate-900 transition">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-lg sm:text-xl font-light text-slate-900 tracking-tight">
                  {binaryStats?.totalDirects || 0}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-light mt-0.5">
                  Active team builders
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#E0C475]/40 hover:border-[#DC2643]/40 p-3.5 sm:p-4 rounded-xl transition-all shadow-xs group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-light text-slate-500">Matching Bonus</span>
                <div className="p-1.5 bg-[#DC2643]/10 text-[#DC2643] rounded-lg border border-[#DC2643]/20 group-hover:bg-[#DC2643] group-hover:text-white transition">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-lg sm:text-xl font-light text-slate-900 tracking-tight">
                  ₹{wallet?.totalMatchingBonus?.toLocaleString() || "0"}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-[#DC2643] font-light mt-0.5">
                  Binary income accumulated
                </p>
              </div>
            </div>
          </div>

          {/* BINARY LEGS */}
          <div className="bg-white border border-[#E0C475]/40 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-[#DC2643]" />
                <h2 className="text-sm font-light text-slate-800">Binary Leg Performance</h2>
              </div>
              <span className="text-[11px] text-slate-400 font-light">Business Volume (BV)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#FAF5EE]/60 p-3.5 rounded-xl border border-[#E0C475]/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-light text-[#DC2643]">Left Leg</span>
                  <span className="text-[11px] text-slate-500 font-light">Agents: {binaryStats?.leftLeg?.totalAgents || 0}</span>
                </div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-lg font-light text-slate-900">{binaryStats?.leftLeg?.currentBV || 0} <span className="text-xs text-slate-500 font-light">BV</span></span>
                </div>
                <div className="w-full bg-[#E0C475]/20 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#DC2643] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((binaryStats?.leftLeg?.currentBV || 0) / 10000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-[#FAF5EE]/60 p-3.5 rounded-xl border border-[#E0C475]/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-light text-[#F59E35]">Right Leg</span>
                  <span className="text-[11px] text-slate-500 font-light">Agents: {binaryStats?.rightLeg?.totalAgents || 0}</span>
                </div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-lg font-light text-slate-900">{binaryStats?.rightLeg?.currentBV || 0} <span className="text-xs text-slate-500 font-light">BV</span></span>
                </div>
                <div className="w-full bg-[#E0C475]/20 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#F59E35] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((binaryStats?.rightLeg?.currentBV || 0) / 10000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT DOWNLINES TABLE */}
          <div className="bg-white border border-[#E0C475]/40 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-light text-slate-800">Recent Downline Registrations</h2>
              <button className="text-xs text-[#DC2643] hover:text-[#b81d34] font-light flex items-center cursor-pointer">
                View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-light text-slate-600">
                <thead className="bg-[#FAF5EE] text-slate-500 uppercase text-[10px] tracking-wider border-b border-[#E0C475]/40">
                  <tr>
                    <th className="py-2.5 px-3.5 font-light">Member</th>
                    <th className="py-2.5 px-3.5 font-light">Distributor ID</th>
                    <th className="py-2.5 px-3.5 font-light">Leg Position</th>
                    <th className="py-2.5 px-3.5 font-light">Join Date</th>
                    <th className="py-2.5 px-3.5 font-light">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF5EE]">
                  {recentDownlines && recentDownlines.length > 0 ? (
                    recentDownlines.map((item, index) => (
                      <tr key={index} className="hover:bg-[#FAF5EE]/50 transition">
                        <td className="py-2.5 px-3.5 font-light text-slate-800 flex items-center space-x-2">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.fullName}</span>
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-[#F59E35] font-light">{item.distributerId}</td>
                        <td className="py-2.5 px-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-light ${
                            item.position === "Left" 
                              ? "bg-[#DC2643]/10 text-[#DC2643] border border-[#DC2643]/20" 
                              : "bg-[#F59E35]/15 text-[#F59E35] border border-[#F59E35]/30"
                          }`}>
                            {item.position} Leg
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-500 font-light">{item.createdAt || "Recently"}</td>
                        <td className="py-2.5 px-3.5">
                          <span className="inline-flex items-center text-[11px] text-[#F59E35] font-light">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E35] mr-1.5"></span> Active
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-slate-400 font-light">
                        No recent downlines found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

    </div>
  );
};

export default Dashboard;