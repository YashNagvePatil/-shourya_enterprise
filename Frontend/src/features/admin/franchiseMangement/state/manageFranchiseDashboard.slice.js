import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Metrics payload from getDashboardOverview
  metrics: {
    totalFranchises: 0,
    pendingApplications: 0,
    tierBreakdown: [],
    gmv: 0,
    totalOrders: 0,
  },

  // Analytics trend data from getNetworkAnalytics
  analytics: [],

  // Isolated loading states for each endpoint
  loading: {
    overview: false,
    analytics: false,
  },

  // Error state
  error: null,
};

const adminDashboardSlice = createSlice({
  name: "adminDashboardForFranchise",
  initialState,
  reducers: {
    // --- Loading Reducers ---
    setOverviewLoading: (state, action) => {
      state.loading.overview = action.payload;
    },
    setAnalyticsLoading: (state, action) => {
      state.loading.analytics = action.payload;
    },

    // --- Error Reducers ---
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // --- Data Success Reducers ---
    setDashboardOverview: (state, action) => {
      state.metrics = action.payload;
    },
    setNetworkAnalytics: (state, action) => {
      state.analytics = action.payload;
    },

    // --- Reset Reducer ---
    resetDashboardState: () => initialState,
  },
});

export const {
  setOverviewLoading,
  setAnalyticsLoading,
  setError,
  clearError,
  setDashboardOverview,
  setNetworkAnalytics,
  resetDashboardState,
} = adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;