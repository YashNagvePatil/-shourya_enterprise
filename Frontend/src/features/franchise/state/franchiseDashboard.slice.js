import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  financials: {
    totalEarnings: 0,
    pendingRent: 0,
    pendingRoi: 0,
    totalCommission: 0,
  },
  metrics: {
    totalSalesCount: 0,
    activeSupplyRequests: 0,
    lowStockAlerts: 0,
  },
  dateFilter: "monthly", // 'daily' | 'weekly' | 'monthly' | 'yearly'
};

const franchiseDashboardSlice = createSlice({
  name: "franchiseDashboard",
  initialState,
  reducers: {
    setFinancialOverview: (state, action) => {
      state.financials = { ...state.financials, ...action.payload };
    },
    setDashboardMetrics: (state, action) => {
      state.metrics = { ...state.metrics, ...action.payload };
    },
    setDateFilter: (state, action) => {
      state.dateFilter = action.payload;
    },
    resetDashboardState: () => initialState,
  },
});

export const {
  setFinancialOverview,
  setDashboardMetrics,
  setDateFilter,
  resetDashboardState,
} = franchiseDashboardSlice.actions;

export const selectFinancials = (state) => state.franchiseDashboard.financials;
export const selectDashboardMetrics = (state) => state.franchiseDashboard.metrics;
export const selectDashboardDateFilter = (state) => state.franchiseDashboard.dateFilter;

export default franchiseDashboardSlice.reducer;