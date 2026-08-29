import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  payouts: [],
  systemLiabilities: {
    totalPendingRent: 0,
    totalPendingRoi: 0,
    totalWalletBalance: 0
  },
  pendingWithdrawals: [],
  selectedFranchiseLedger: {
    transactions: [],
    payouts: []
  },
  loading: {
    summary: false,
    settlement: false,
    reviewWithdrawal: false,
    ledger: false
  },
  error: null,
  successMessage: null
};

const franchiseFinancialSlice = createSlice({
  name: "managefranchiseFinancial",
  initialState,
  reducers: {
    // 1. Loading State Management (Key-based)
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      if (key in state.loading) {
        state.loading[key] = value;
      }
    },

    // 2. Messaging Controls
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },

    // 3. Financial Summary Update (Matches Backend Output)
    setFinancialSummary: (state, action) => {
      const { payoutsSummary, systemLiabilities, pendingWithdrawals } = action.payload || {};
      state.payouts = payoutsSummary || [];
      state.systemLiabilities = systemLiabilities || {
        totalPendingRent: 0,
        totalPendingRoi: 0,
        totalWalletBalance: 0
      };
      state.pendingWithdrawals = pendingWithdrawals || [];
    },

    // 4. Update Pending Withdrawal Status (Approve/Reject locally)
    removePendingWithdrawal: (state, action) => {
      const requestId = action.payload;
      state.pendingWithdrawals = state.pendingWithdrawals.filter(
        (item) => item._id !== requestId
      );
    },

    // 5. Settlement Push Reducer (NEW: Local update after settlement)
    addSettlementPayout: (state, action) => {
      const newPayout = action.payload;
      // Add payout or update aggregated payout count
      state.payouts.push(newPayout);
    },

    // 6. Set Specific Franchise Financial Ledger (NEW)
    setFranchiseLedger: (state, action) => {
      state.selectedFranchiseLedger = {
        transactions: action.payload.transactions || [],
        payouts: action.payload.payouts || []
      };
    },

    // 7. Clear Selected Ledger (On modal/view unmount)
    clearFranchiseLedger: (state) => {
      state.selectedFranchiseLedger = { transactions: [], payouts: [] };
    }
  }
});

export const {
  setLoading,
  setError,
  setSuccessMessage,
  clearMessages,
  setFinancialSummary,
  removePendingWithdrawal,
  addSettlementPayout,
  setFranchiseLedger,
  clearFranchiseLedger
} = franchiseFinancialSlice.actions;

export default franchiseFinancialSlice.reducer;