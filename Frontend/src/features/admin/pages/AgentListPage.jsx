import React from "react";
import { useNavigate } from "react-router"; 
import { useAgentList } from "../hook/useAdmin";

const AgentListPage = ({ onSelectAgent }) => {
  const navigate = useNavigate(); // 2. Hook initialize karein

  const {
    agentsList,
    pagination,
    filters,
    isLoading,
    error,
    handleSearchChange,
    handleStatusChange,
    handlePageChange,
    refreshList,
  } = useAgentList();

  // 3. Click Handler Function
  const handleAgentClick = (agentId) => {
    if (onSelectAgent) {
      onSelectAgent(agentId); // Parent component callback (if any)
    }
    // Navigate with Query Parameter
    navigate(`/admin/agentDetails?id=${agentId}`);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Agent List Management</h1>
        <button
          onClick={() => refreshList()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={filters.status}
          onChange={(e) => handleStatusChange(e.target.value)}
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
                  onClick={() => handleAgentClick(agent._id)} // <-- Dynamic navigation trigger
                  className="hover:bg-slate-100/80 cursor-pointer transition"
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
                  <td className="p-4 text-right text-indigo-600 font-medium">
                    View Details →
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Bar */}
        <div className="flex justify-between items-center p-4 border-t border-slate-200 text-sm text-slate-600">
          <div>
            Total Agents: <span className="font-semibold">{pagination.totalCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={!pagination.hasPrevPage || isLoading}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              className="px-3 py-1.5 bg-slate-100 rounded border hover:bg-slate-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              disabled={!pagination.hasNextPage || isLoading}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              className="px-3 py-1.5 bg-slate-100 rounded border hover:bg-slate-200 disabled:opacity-50"
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