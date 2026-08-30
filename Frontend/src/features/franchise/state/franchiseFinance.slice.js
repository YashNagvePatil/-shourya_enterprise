import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Financial Overview State
  financials: {
    wallet: {
      balance: 0,
      pendingRent: 0,
      pendingRoi: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
    },
    bankDetailsConfigured: false,
    activePendingWithdrawal: null,
  },

  // Passbook State
  passbook: {
    transactions: [],
    pagination: {
      totalRecords: 0,
      currentPage: 1,
      totalPages: 1,
      limit: 10,
    },
  },

  // Analytics Chart State
  analytics: [],
  analyticsFilter: "monthly",
};

const franchiseFinanceSlice = createSlice({
  name: "franchiseFinance",
  initialState,
  reducers: {
    setFinancialOverview: (state, action) => {
      state.financials = action.payload;
    },
    setPassbookData: (state, action) => {
      state.passbook.transactions = action.payload.transactions;
      state.passbook.pagination = action.payload.pagination;
    },
    setAnalyticsData: (state, action) => {
      state.analytics = action.payload.analytics;
      if (action.payload.filter) {
        state.analyticsFilter = action.payload.filter;
      }
    },
    setAnalyticsFilter: (state, action) => {
      state.analyticsFilter = action.payload;
    },
    updateWalletBalance: (state, action) => {
      state.financials.wallet.balance = action.payload;
    },
    setActivePendingWithdrawal: (state, action) => {
      state.financials.activePendingWithdrawal = action.payload;
    },
    resetFinanceState: () => initialState,
  },
});

export const {
  setFinancialOverview,
  setPassbookData,
  setAnalyticsData,
  setAnalyticsFilter,
  updateWalletBalance,
  setActivePendingWithdrawal,
  resetFinanceState,
} = franchiseFinanceSlice.actions;

export default franchiseFinanceSlice.reducer;