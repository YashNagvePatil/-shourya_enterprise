import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // --- Dashboard State ---
  summary: {
    totalAgents: 0,
    activeAgents: 0,
    blockedAgents: 0,
    inactiveAgents: 0,
  },
  recentAgents: [],
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
  filters: {
    search: "",
    status: "",
    role: "",
  },

  // --- Single Agent Deep Details State (API 1) ---
  selectedAgent: null,
  isDetailLoading: false,

  // --- Agent Action States (API 2) ---
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
      const data = action.payload?.data || action.payload;
      state.summary = data?.summary || initialState.summary;
      state.recentAgents = data?.recentAgents || [];
      state.monthlyTrend = data?.monthlyTrend || [];
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
      state.agentsList = response?.data || [];
      if (response?.pagination) {
        state.pagination = response.pagination;
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
    setAgentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },

    // ==========================================
    // 1. GET AGENT BY ID REDUCERS
    // (network, revenue & recentWork ko store karega)
    // ==========================================
    fetchAgentDetailsStart: (state) => {
      state.isDetailLoading = true;
      state.error = null;
    },
    fetchAgentDetailsSuccess: (state, action) => {
      state.isDetailLoading = false;
      state.error = null;
      // Controller Response: { success: true, data: { ...agent, network, revenue, recentWork } }
      state.selectedAgent = action.payload?.data || action.payload;
    },
    fetchAgentDetailsFailure: (state, action) => {
      state.isDetailLoading = false;
      state.error = action.payload;
    },

    // ==========================================
    // 2. TOGGLE AGENT STATUS REDUCERS
    // (Block / Active Change Karega)
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

      // Case A: Agar Single Agent Overview Open hai, toh wahan status update karo
      if (state.selectedAgent && state.selectedAgent._id === updatedAgent._id) {
        state.selectedAgent.status = updatedAgent.status;
        state.selectedAgent.blockReason = updatedAgent.blockReason;
      }

      // Case B: Agents List (Table View) mein bhi status real-time update karo
      state.agentsList = state.agentsList.map((agent) =>
        agent._id === updatedAgent._id
          ? { ...agent, status: updatedAgent.status, blockReason: updatedAgent.blockReason }
          : agent
      );
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
  setAgentPage,

  // Single Agent Actions (New)
  fetchAgentDetailsStart,
  fetchAgentDetailsSuccess,
  fetchAgentDetailsFailure,

  // Status Action (New)
  toggleAgentStatusStart,
  toggleAgentStatusSuccess,
  toggleAgentStatusFailure,

  // Utility Actions
  clearSelectedAgent,
  clearAdminError,
  resetAdminState,
  
} = adminSlice.actions;

export default adminSlice.reducer;