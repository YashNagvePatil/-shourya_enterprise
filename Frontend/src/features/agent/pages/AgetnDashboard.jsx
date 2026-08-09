import React from "react";

export const AgentDashboard = () => {
  // Static Dummy Data for UI Display
  const agentProfile = {
    fullName: "Rahul Sharma",
    distributerId: "AGT1002",
    rank: "Bronze",
    status: "Active",
    totalEarnings: "45,000",
    walletBalance: "12,500",
    totalDirects: 12,
    totalTeam: 148,
    kycStatus: "Pending",
  };

  const binaryStats = {
    leftLeg: {
      totalMembers: 85,
      activeMembers: 60,
      currentBV: 1200,
      totalBV: 5400,
      refLink: "https://yourapp.com/register?sponsor=AGT1002&side=left",
    },
    rightLeg: {
      totalMembers: 63,
      activeMembers: 42,
      currentBV: 800,
      totalBV: 3800,
      refLink: "https://yourapp.com/register?sponsor=AGT1002&side=right",
    },
  };

  const recentDownlines = [
    { id: "AGT1045", name: "Aarav Patel", position: "Left", date: "08 Aug 2026", status: "Active" },
    { id: "AGT1046", name: "Priya Verma", position: "Right", date: "07 Aug 2026", status: "Pending" },
    { id: "AGT1047", name: "Vikram Singh", position: "Left", date: "06 Aug 2026", status: "Active" },
    { id: "AGT1048", name: "Neha Gupta", position: "Right", date: "05 Aug 2026", status: "Active" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ================= 1. HEADER BAR ================= */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-sky-600/20">
              {agentProfile.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-900">{agentProfile.fullName}</h1>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                  🥉 {agentProfile.rank}
                </span>
              </div>
              <p className="text-xs text-slate-500">ID: <span className="font-mono font-medium text-slate-700">{agentProfile.distributerId}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-initial px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium rounded-xl shadow-xs transition-all cursor-pointer">
              + Add New Agent
            </button>
            <button className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-all cursor-pointer">
              Withdraw Funds
            </button>
          </div>
        </div>

        {/* KYC Warning Banner */}
        {agentProfile.kycStatus === "Pending" && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex justify-between items-center">
            <span>⚠️ <strong>KYC Pending:</strong> Complete your KYC verification to enable wallet withdrawals.</span>
            <button className="text-xs bg-amber-600 text-white px-3 py-1 rounded-lg font-medium hover:bg-amber-700">Complete KYC</button>
          </div>
        )}

        {/* ================= 2. QUICK STAT CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Total Earnings</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{agentProfile.totalEarnings}</h3>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">↑ Lifetime Earned</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Available Wallet Balance</p>
            <h3 className="text-2xl font-bold text-sky-600 mt-1">₹{agentProfile.walletBalance}</h3>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">Ready to Withdraw</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Direct Referrals</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{agentProfile.totalDirects}</h3>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">Active Sponsors</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Total Downline Team</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{agentProfile.totalTeam}</h3>
            <span className="text-[11px] text-slate-500 mt-1 inline-block">Left + Right Leg</span>
          </div>
        </div>

        {/* ================= 3. BINARY LEGS BREAKDOWN ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Leg Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Left Leg Business
              </h3>
              <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">Current BV: {binaryStats.leftLeg.currentBV}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-500">Total Members</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">{binaryStats.leftLeg.totalMembers}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-500">Active Members</p>
                <p className="text-base font-bold text-emerald-600 mt-0.5">{binaryStats.leftLeg.activeMembers}</p>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Left Referral Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={binaryStats.leftLeg.refLink}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-slate-600 focus:outline-none"
                />
                <button className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg cursor-pointer transition-all">Copy</button>
              </div>
            </div>
          </div>

          {/* Right Leg Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Right Leg Business
              </h3>
              <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">Current BV: {binaryStats.rightLeg.currentBV}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-500">Total Members</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">{binaryStats.rightLeg.totalMembers}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-500">Active Members</p>
                <p className="text-base font-bold text-emerald-600 mt-0.5">{binaryStats.rightLeg.activeMembers}</p>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Right Referral Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={binaryStats.rightLeg.refLink}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-slate-600 focus:outline-none"
                />
                <button className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg cursor-pointer transition-all">Copy</button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 4. BINARY TREE VISUALIZER (STATIC) ================= */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Genealogy / Binary Tree Preview</h3>
          
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/60 flex flex-col items-center gap-6 overflow-x-auto">
            {/* Root Node */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                YOU
              </div>
              <span className="text-[11px] font-semibold text-slate-800 mt-1">{agentProfile.fullName}</span>
              <span className="text-[10px] text-slate-400 font-mono">{agentProfile.distributerId}</span>
            </div>

            {/* Connecting Lines */}
            <div className="w-32 border-t-2 border-slate-300 relative -mt-3"></div>

            {/* Level 1 Nodes */}
            <div className="flex justify-between w-64 -mt-3">
              {/* Left Child */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  L1
                </div>
                <span className="text-[11px] font-medium text-slate-700 mt-1">Aarav Patel</span>
                <span className="text-[10px] text-emerald-600 font-medium">Active</span>
              </div>

              {/* Right Child */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  R1
                </div>
                <span className="text-[11px] font-medium text-slate-700 mt-1">Priya Verma</span>
                <span className="text-[10px] text-amber-600 font-medium">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 5. RECENT DOWNLINE JOININGS ================= */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Recent Registrations</h3>
            <button className="text-xs text-sky-600 hover:text-sky-700 font-medium">View All →</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="pb-3">Agent Name</th>
                  <th className="pb-3">Distributer ID</th>
                  <th className="pb-3">Placement</th>
                  <th className="pb-3">Joining Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentDownlines.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="py-3 font-mono">{item.id}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.position === "Left" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"
                      }`}>
                        {item.position} Leg
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{item.date}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AgentDashboard;