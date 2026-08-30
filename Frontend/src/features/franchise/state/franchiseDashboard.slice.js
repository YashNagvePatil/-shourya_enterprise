import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Financial Overview Metrics
  financials: {
    walletBalance: 0,
    totalEarnings: 0,
    pendingRent: 0,
    pendingRoi: 0,
    totalCommission: 0,
    totalWithdrawn: 0,
    activePendingWithdrawal: null, // Active withdrawal under admin review
  },

  // Operational & Inventory Metrics
  metrics: {
    totalSalesCount: 0,
    activeSupplyRequests: 0,
    lowStockAlerts: 0,
  },

  // 📊 NEW: Dynamic Chart Analytics Data
  analytics: [], // Stores [{ label: 'Jan', amount: 12000, heightPercentage: '40%' }, ...]

  // UI State Filters & Controls
  dateFilter: "monthly", // 'daily' | 'weekly' | 'monthly' | 'yearly'
  loading: false,
  error: null,
};

const franchiseDashboardSlice = createSlice({
  name: "franchiseDashboard",
  initialState,
  reducers: {
    // 1. Setters for Data Hydration
    setFinancialOverview: (state, action) => {
      state.financials = { ...state.financials, ...action.payload };
    },
    setDashboardMetrics: (state, action) => {
      state.metrics = { ...state.metrics, ...action.payload };
    },
    
    // 📊 NEW: Setter for Dynamic Bar Chart Analytics
    setAnalyticsData: (state, action) => {
      state.analytics = action.payload || [];
    },

    // 2. Set Combined Dashboard Data (Single Bulk Payload Option)
    setDashboardData: (state, action) => {
      if (action.payload.financials) {
        state.financials = { ...state.financials, ...action.payload.financials };
      }
      if (action.payload.metrics) {
        state.metrics = { ...state.metrics, ...action.payload.metrics };
      }
      if (action.payload.analytics) {
        state.analytics = action.payload.analytics;
      }
    },

    // 3. UI Controls & Filter States
    setDateFilter: (state, action) => {
      state.dateFilter = action.payload;
    },
    setDashboardLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setDashboardError: (state, action) => {
      state.error = action.payload;
    },
    clearDashboardError: (state) => {
      state.error = null;
    },

    // 4. Reset State on Logout/Unmount
    resetDashboardState: () => initialState,
  },
});

// Export Pure Actions
export const {
  setFinancialOverview,
  setDashboardMetrics,
  setAnalyticsData, // 👈 New Action
  setDashboardData,
  setDateFilter,
  setDashboardLoading,
  setDashboardError,
  clearDashboardError,
  resetDashboardState,
} = franchiseDashboardSlice.actions;

// Export Clean Selectors
export const selectFinancials = (state) => state.franchiseDashboard.financials;
export const selectDashboardMetrics = (state) => state.franchiseDashboard.metrics;
export const selectAnalyticsData = (state) => state.franchiseDashboard.analytics; // 👈 New Selector
export const selectDashboardDateFilter = (state) => state.franchiseDashboard.dateFilter;
export const selectDashboardLoading = (state) => state.franchiseDashboard.loading;
export const selectDashboardError = (state) => state.franchiseDashboard.error;

export default franchiseDashboardSlice.reducer;