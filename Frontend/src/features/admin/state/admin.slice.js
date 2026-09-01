import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // --- Dashboard Overview State ---
  summary: {
    totalAgents: 0,
    activeAgents: 0,
    blockedAgents: 0,
    inactiveAgents: 0,
    pendingKycCount: 0,
    totalFranchises: 0,
    activeFranchises: 0,
  },

  // --- Global Binary Tree & Financial Overview State ---
  binaryOverview: {
    totalLeftPV: 0,
    totalRightPV: 0,
    matchedPV: 0,
    pendingPayoutsCount: 0,
    unmatchedCarryForwardPV: 0,
  },

  // --- Actionable System Badges ---
  actionAlerts: {
    pendingKYCApprovals: 0,
    pendingFranchiseRequests: 0,
  },

  recentAgents: [],
  recentFranchises: [],
  monthlyTrend: [],

  // --- Agents List State ---
  agentsList: [],
  pagination: {
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },
  
  // Dynamic backend filters matrix alignment
  filters: {
    search: "",
    status: "",
    role: "",
    rank: "",
    kycStatus: "",
    startDate: null,
    endDate: null,
    sortBy: "createdAt",
    sortOrder: "desc",
  },

  // --- Single Agent Deep Details State ---
  selectedAgent: null,
  isDetailLoading: false,

  // --- Agent Action States ---
  isActionLoading: false,

  // --- Common UI States ---
  isLoading: false,
  error: null,
  isSuccess: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    // ==========================================
    // DASHBOARD REDUCERS
    // ==========================================
    fetchDashboardStart: (state) => {
      state.isLoading = true;
      state.error = null;
      state.isSuccess = false;
    },
    fetchDashboardSuccess: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.error = null;

      const payloadData = action.payload?.data || action.payload;

      // Deep mapping aligning with backend controller structure
      state.summary = {
        ...state.summary,
        ...(payloadData?.summary || payloadData?.networkOverview || {}),
      };
      state.binaryOverview = {
        ...state.binaryOverview,
        ...(payloadData?.binaryOverview || payloadData?.globalBinaryOverview || {}),
      };
      state.actionAlerts = payloadData?.actionAlerts || initialState.actionAlerts;

      state.recentAgents = payloadData?.recentAgents || payloadData?.agents || [];
      state.recentFranchises = payloadData?.recentFranchises || [];
      state.monthlyTrend = payloadData?.monthlyTrend || [];
    },
    fetchDashboardFailure: (state, action) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.error = action.payload;
    },

    // ==========================================
    // AGENT LIST REDUCERS
    // ==========================================
    fetchAgentsListStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchAgentsListSuccess: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.error = null;

      const response = action.payload;
      const dataPayload = response?.data;

      // Handle both array response or nested agents list payload
      if (Array.isArray(dataPayload)) {
        state.agentsList = dataPayload;
      } else if (dataPayload?.agents) {
        state.agentsList = dataPayload.agents;
      } else {
        state.agentsList = [];
      }

      // Automatically sync UI top summary badges if provided in response
      if (dataPayload?.metricsSummary) {
        state.summary = {
          ...state.summary,
          ...dataPayload.metricsSummary,
        };
      }

      // Sync Pagination Metadata
      if (response?.pagination || dataPayload?.pagination) {
        state.pagination = response?.pagination || dataPayload?.pagination;
      }
    },
    fetchAgentsListFailure: (state, action) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.error = action.payload;
    },

    setAgentFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetAgentFilters: (state) => {
      state.filters = initialState.filters;
    },
    setAgentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },

    // ==========================================
    // SINGLE AGENT DEEP DETAILS REDUCERS
    // ==========================================
    fetchAgentDetailsStart: (state) => {
      state.isDetailLoading = true;
      state.error = null;
    },
    fetchAgentDetailsSuccess: (state, action) => {
      state.isDetailLoading = false;
      state.error = null;
      // Stores structured data from updated getAgentById controller
      state.selectedAgent = action.payload?.data || action.payload;
    },
    fetchAgentDetailsFailure: (state, action) => {
      state.isDetailLoading = false;
      state.error = action.payload;
    },

  // ==========================================
    // TOGGLE AGENT STATUS & KYC REDUCERS
    // ==========================================
    toggleAgentStatusStart: (state) => {
      state.isActionLoading = true;
      state.error = null;
      state.isSuccess = false;
    },
    toggleAgentStatusSuccess: (state, action) => {
      state.isActionLoading = false;
      state.isSuccess = true;
      state.error = null;

      const updatedAgent = action.payload?.data || action.payload;
      const agentId = updatedAgent._id || updatedAgent.agentId;

      // Find existing agent to track previous values for counters
      const existingAgent = state.agentsList.find(
        (a) => a._id === agentId || a.agentId === agentId
      );

      const previousStatus = existingAgent?.status;
      const previousKycStatus = existingAgent?.kycStatus || state.selectedAgent?.kycStatus;

      // Case A: Update selected detailed view if open
      if (
        state.selectedAgent &&
        (state.selectedAgent._id === agentId || state.selectedAgent.agentId === agentId)
      ) {
        if (updatedAgent.status !== undefined) {
          state.selectedAgent.status = updatedAgent.status;
          state.selectedAgent.blockReason = updatedAgent.blockReason;
        }
        if (updatedAgent.kycStatus !== undefined) {
          state.selectedAgent.kycStatus = updatedAgent.kycStatus;
        }
      }

      // Case B: Update Agents Table Row
      state.agentsList = state.agentsList.map((agent) =>
        agent._id === agentId || agent.agentId === agentId
          ? {
              ...agent,
              ...(updatedAgent.status !== undefined && {
                status: updatedAgent.status,
                blockReason: updatedAgent.blockReason,
              }),
              ...(updatedAgent.kycStatus !== undefined && {
                kycStatus: updatedAgent.kycStatus,
              }),
            }
          : agent
      );

      // Case C: Live Update Account Status Counters
      if (
        updatedAgent.status !== undefined &&
        previousStatus &&
        previousStatus !== updatedAgent.status
      ) {
        if (updatedAgent.status === "Blocked") {
          state.summary.activeAgents = Math.max(0, state.summary.activeAgents - 1);
          state.summary.blockedAgents += 1;
        } else if (updatedAgent.status === "Active") {
          state.summary.blockedAgents = Math.max(0, state.summary.blockedAgents - 1);
          state.summary.activeAgents += 1;
        }
      }

      // Case D: Live Update KYC Pending Counters
      if (
        updatedAgent.kycStatus !== undefined &&
        previousKycStatus === "Pending" &&
        updatedAgent.kycStatus !== "Pending"
      ) {
        if (state.summary.pendingKycCount > 0) {
          state.summary.pendingKycCount = Math.max(0, state.summary.pendingKycCount - 1);
        }
        if (state.actionAlerts.pendingKYCApprovals > 0) {
          state.actionAlerts.pendingKYCApprovals = Math.max(
            0,
            state.actionAlerts.pendingKYCApprovals - 1
          );
        }
      }
    },
    toggleAgentStatusFailure: (state, action) => {
      state.isActionLoading = false;
      state.isSuccess = false;
      state.error = action.payload;
    },

    // ==========================================
    // UTILITY REDUCERS
    // ==========================================
    clearSelectedAgent: (state) => {
      state.selectedAgent = null;
    },
    clearAdminError: (state) => {
      state.error = null;
    },
    resetAdminState: () => initialState,
  },
});

export const {
  // Dashboard Actions
  fetchDashboardStart,
  fetchDashboardSuccess,
  fetchDashboardFailure,

  // Agent List Actions
  fetchAgentsListStart,
  fetchAgentsListSuccess,
  fetchAgentsListFailure,
  setAgentFilters,
  resetAgentFilters,
  setAgentPage,

  // Single Agent Actions
  fetchAgentDetailsStart,
  fetchAgentDetailsSuccess,
  fetchAgentDetailsFailure,

  // Status Action
  toggleAgentStatusStart,
  toggleAgentStatusSuccess,
  toggleAgentStatusFailure,

  // Utility Actions
  clearSelectedAgent,
  clearAdminError,
  resetAdminState,
} = adminSlice.actions;

export default adminSlice.reducer;