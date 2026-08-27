import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  payouts: [],
  pendingWithdrawals: [],
  loading: {
    summary: false,
    settlement: false,
  },
  error: null,
  successMessage: null,
};

const franchiseFinancialSlice = createSlice({
  name: "managefranchiseFinancial",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
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
    setFinancialSummary: (state, action) => {
      state.payouts = action.payload.payouts || [];
      state.pendingWithdrawals = action.payload.pendingWithdrawals || [];
    },
    removePendingWithdrawal: (state, action) => {
      state.pendingWithdrawals = state.pendingWithdrawals.filter(
        (item) => item._id !== action.payload
      );
    },
  },
});

export const {
  setLoading,
  setError,
  setSuccessMessage,
  clearMessages,
  setFinancialSummary,
  removePendingWithdrawal,
} = franchiseFinancialSlice.actions;

export default franchiseFinancialSlice.reducer;