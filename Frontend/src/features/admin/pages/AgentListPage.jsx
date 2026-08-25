import React from "react";
import { useNavigate } from "react-router"; // Updated to react-router-dom
import { useAgentList } from "../hook/useAdmin";

const AgentListPage = ({ onSelectAgent }) => {
  const navigate = useNavigate();

  const {
    agentsList = [],
    pagination = {},
    filters = {},
    isLoading,
    error,
    handleSearchChange,
    handleStatusChange,
    handlePageChange,
    refreshList,
  } = useAgentList();

  // Click Handler Function
  const handleAgentClick = (e, agentId) => {
    e.preventDefault();
    if (typeof onSelectAgent === "function") {
      onSelectAgent(agentId);
    }
    navigate(`/admin/agentDetails?id=${agentId}`);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Agent List Management</h1>
        <button
          type="button"
          onClick={() => refreshList && refreshList()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={filters.search || ""}
          onChange={(e) => handleSearchChange && handleSearchChange(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
        />

        <select
          value={filters.status || ""}
          onChange={(e) => handleStatusChange && handleStatusChange(e.target.value)}
          className="px-4 py-2 border rounded-lg text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Blocked">Blocked</option>
        </select>
      </div>

      {/* Error View */}
      {error && (
        <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Table Data Render */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading agents list...</div>
        ) : agentsList.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No agents found</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {agentsList.map((agent) => (
                <tr
                  key={agent._id}
                  className="hover:bg-slate-100/80 transition"
                >
                  <td className="p-4 font-medium text-slate-800">{agent.fullName}</td>
                  <td className="p-4 text-slate-600">{agent.email}</td>
                  <td className="p-4 text-slate-600">{agent.role}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        agent.status === "Active"
                          ? "bg-emerald-100 text-emerald-800"
                          : agent.status === "Blocked"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => handleAgentClick(e, agent._id)}
                      className="text-indigo-600 font-medium hover:underline cursor-pointer"
                    >
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Bar */}
        <div className="flex justify-between items-center p-4 border-t border-slate-200 text-sm text-slate-600">
          <div>
            Total Agents: <span className="font-semibold">{pagination.totalCount || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!pagination.hasPrevPage || isLoading}
              onClick={() => handlePageChange && handlePageChange(pagination.currentPage - 1)}
              className="px-3 py-1.5 bg-slate-100 rounded border hover:bg-slate-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span>
              Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={!pagination.hasNextPage || isLoading}
              onClick={() => handlePageChange && handlePageChange(pagination.currentPage + 1)}
              className="px-3 py-1.5 bg-slate-100 rounded border hover:bg-slate-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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