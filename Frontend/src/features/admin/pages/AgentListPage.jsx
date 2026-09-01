import React from "react";
import { useNavigate } from "react-router";
import { useAgentList, useAdmin } from "../hook/useAdmin";

const AgentListPage = ({ onSelectAgent }) => {
  const navigate = useNavigate();

  const { summary } = useAdmin();

  const {
    agentsList = [],
    pagination = {},
    filters = {},
    isLoading,
    error,
    handleSearchChange,
    handleFilterChange,
    handleResetFilters,
    handlePageChange,
    refreshList,
  } = useAgentList();

  const handleAgentClick = (e, agentId) => {
    e.preventDefault();
    if (typeof onSelectAgent === "function") {
      onSelectAgent(agentId);
    }
    navigate(`/admin/agentDetails?id=${agentId}`);
  };

  return (
    <div className="p-8 bg-[#FFFDF9] min-h-screen text-[#4A3B32] font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-[#EAD8C0]/60 pb-6">
        <div>
          <h1 className="text-3xl font-light text-[#D32F2F] tracking-wide">
            Agent Directory
          </h1>
          <p className="text-sm font-normal text-[#8C6D58] mt-1">
            Manage field agents, track network growth, and monitor performance status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleResetFilters && handleResetFilters()}
            className="px-4 py-2 bg-[#FFF8F0] hover:bg-[#FCECDD] text-[#8C6D58] rounded-xl text-sm font-normal border border-[#EAD8C0] transition cursor-pointer"
          >
            Clear Filters
          </button>
          <button
            type="button"
            onClick={() => refreshList && refreshList()}
            className="px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-xl text-sm font-normal shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Agents */}
        <div className="bg-[#FFF8F0] p-5 rounded-2xl border border-[#EAD8C0] shadow-sm">
          <span className="text-xs font-normal text-[#8C6D58] uppercase tracking-wider">Total Agents</span>
          <p className="text-3xl font-light text-[#D32F2F] mt-1">
            {summary?.totalAgents || pagination?.totalCount || 0}
          </p>
        </div>

        {/* Active Agents */}
        <div className="bg-[#FFF8F0] p-5 rounded-2xl border border-[#EAD8C0] shadow-sm">
          <span className="text-xs font-normal text-[#8C6D58] uppercase tracking-wider">Active Agents</span>
          <p className="text-3xl font-light text-[#2E7D32] mt-1">
            {summary?.activeAgents || 0}
          </p>
        </div>

        {/* Pending KYC */}
        <div className="bg-[#FFF8F0] p-5 rounded-2xl border border-[#EAD8C0] shadow-sm">
          <span className="text-xs font-normal text-[#8C6D58] uppercase tracking-wider">Pending KYC</span>
          <p className="text-3xl font-light text-[#F57C00] mt-1">
            {summary?.pendingKycCount || 0}
          </p>
        </div>

        {/* Blocked Agents */}
        <div className="bg-[#FFF8F0] p-5 rounded-2xl border border-[#EAD8C0] shadow-sm">
          <span className="text-xs font-normal text-[#8C6D58] uppercase tracking-wider">Blocked Agents</span>
          <p className="text-3xl font-light text-[#C62828] mt-1">
            {summary?.blockedAgents || 0}
          </p>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EAD8C0] shadow-sm mb-6 flex flex-wrap lg:flex-nowrap gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[280px]">
          <svg className="w-5 h-5 absolute left-3.5 top-3 text-[#B08B6E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search agent name, email or code..."
            value={filters.search || ""}
            onChange={(e) => handleSearchChange && handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FFF8F0] border border-[#EAD8C0] rounded-xl text-[#4A3B32] placeholder-[#B08B6E] focus:outline-none focus:ring-1 focus:ring-[#D32F2F] text-sm font-normal"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select
            value={filters.status || ""}
            onChange={(e) => handleFilterChange && handleFilterChange({ status: e.target.value })}
            className="px-4 py-2.5 bg-[#FFF8F0] border border-[#EAD8C0] rounded-xl text-[#4A3B32] text-sm font-normal focus:outline-none focus:ring-1 focus:ring-[#D32F2F] cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Blocked">Blocked</option>
          </select>

          <select
            value={filters.role || ""}
            onChange={(e) => handleFilterChange && handleFilterChange({ role: e.target.value })}
            className="px-4 py-2.5 bg-[#FFF8F0] border border-[#EAD8C0] rounded-xl text-[#4A3B32] text-sm font-normal focus:outline-none focus:ring-1 focus:ring-[#D32F2F] cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="Agent">Agent</option>
            <option value="MasterAgent">Master Agent</option>
            <option value="Franchise">Franchise</option>
          </select>

          <select
            value={filters.kycStatus || ""}
            onChange={(e) => handleFilterChange && handleFilterChange({ kycStatus: e.target.value })}
            className="px-4 py-2.5 bg-[#FFF8F0] border border-[#EAD8C0] rounded-xl text-[#4A3B32] text-sm font-normal focus:outline-none focus:ring-1 focus:ring-[#D32F2F] cursor-pointer"
          >
            <option value="">All KYC</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Error View */}
      {error && (
        <div className="p-4 mb-6 bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] rounded-xl text-sm font-normal flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => refreshList && refreshList()} className="text-xs bg-[#D32F2F] px-3 py-1 rounded text-white font-normal hover:bg-[#B71C1C]">
            Retry
          </button>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-[#EAD8C0] overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-[#8C6D58]">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#EAD8C0] border-t-[#D32F2F] mb-3"></div>
            <p className="text-sm font-normal">Loading agents list...</p>
          </div>
        ) : agentsList.length === 0 ? (
          <div className="p-12 text-center text-[#8C6D58]">
            <p className="text-base font-normal text-[#4A3B32]">No agents found</p>
            <p className="text-xs text-[#B08B6E] mt-1">Try resetting search or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF8F0] border-b border-[#EAD8C0] text-xs font-normal text-[#8C6D58] uppercase tracking-wider">
                  <th className="p-4">Agent Info</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Role & Rank</th>
                  <th className="p-4">KYC Status</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EBE0] text-sm">
                {agentsList.map((agent) => (
                  <tr key={agent._id} className="hover:bg-[#FFF8F0]/60 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#F57C00] text-white font-normal flex items-center justify-center text-sm shadow-xs">
                          {agent.fullName ? agent.fullName.charAt(0).toUpperCase() : "A"}
                        </div>
                        <div>
                          <p className="font-normal text-[#2C221E]">{agent.fullName || "N/A"}</p>
                          <p className="text-xs font-light text-[#8C6D58]">
                            ID: {agent.agentCode || agent._id?.slice(-6) || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-normal text-[#4A3B32]">{agent.email}</p>
                      <p className="text-xs font-light text-[#8C6D58]">{agent.phoneNumber || agent.mobile || "N/A"}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-normal text-[#4A3B32]">{agent.role || "Agent"}</p>
                      <p className="text-xs font-normal text-[#D32F2F]">{agent.rank || "Standard"}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-normal ${
                        agent.kycStatus === "Approved"
                          ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]"
                          : agent.kycStatus === "Rejected"
                          ? "bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A]"
                          : "bg-[#FFF3E0] text-[#EF6C00] border border-[#FFE0B2]"
                      }`}>
                        {agent.kycStatus || "Pending"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-normal ${
                        agent.status === "Active"
                          ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]"
                          : agent.status === "Blocked"
                          ? "bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A]"
                          : "bg-[#FAFAFA] text-[#616161] border border-[#E0E0E0]"
                      }`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => handleAgentClick(e, agent._id)}
                        className="px-3.5 py-1.5 bg-[#FFF8F0] hover:bg-[#FCECDD] text-[#D32F2F] rounded-lg text-xs font-normal border border-[#EAD8C0] transition cursor-pointer"
                      >
                        View Profile →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-[#EAD8C0] bg-[#FFF8F0]/40 text-sm text-[#8C6D58] gap-4">
          <div className="font-light">
            Showing <span className="font-normal text-[#4A3B32]">{agentsList.length}</span> of{" "}
            <span className="font-normal text-[#4A3B32]">{pagination.totalCount || 0}</span> Agents
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!pagination.hasPrevPage || isLoading}
              onClick={() => handlePageChange && handlePageChange(pagination.currentPage - 1)}
              className="px-3.5 py-1.5 bg-white hover:bg-[#FFF8F0] text-[#4A3B32] rounded-lg border border-[#EAD8C0] text-xs font-normal disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="text-[#4A3B32] font-light text-xs px-2">
              Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={!pagination.hasNextPage || isLoading}
              onClick={() => handlePageChange && handlePageChange(pagination.currentPage + 1)}
              className="px-3.5 py-1.5 bg-white hover:bg-[#FFF8F0] text-[#4A3B32] rounded-lg border border-[#EAD8C0] text-xs font-normal disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentListPage;