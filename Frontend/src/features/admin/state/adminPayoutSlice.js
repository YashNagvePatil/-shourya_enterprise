import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Payout List States
  isLoadingRequests: false,
  payoutRequests: [],
  pagination: null,
  
  // Single Payout Action States (Approve/Reject)
  isProcessing: false,
  successMessage: null,
  error: null,
  lastProcessedPayout: null,
};

const adminPayoutSlice = createSlice({
  name: "adminPayout",
  initialState,
  reducers: {
    // ----------------------------------------------------
    //  1. GET PAYOUT REQUESTS LIST ACTIONS
    // ----------------------------------------------------
    fetchRequestsStart: (state) => {
      state.isLoadingRequests = true;
      state.error = null;
    },
    fetchRequestsSuccess: (state, action) => {
      state.isLoadingRequests = false;
      // Interceptor unwrap ke baad res.data me requests aur pagination hoti hain
      state.payoutRequests = action.payload?.requests || [];
      state.pagination = action.payload?.pagination || null;
      state.error = null;
    },
    fetchRequestsFailure: (state, action) => {
      state.isLoadingRequests = false;
      state.error = action.payload || "Failed to fetch payout requests.";
    },

    // ----------------------------------------------------
    //  2. PROCESS PAYOUT ACTIONS (Approve / Reject)
    // ----------------------------------------------------
    processPayoutStart: (state) => {
      state.isProcessing = true;
      state.error = null;
      state.successMessage = null;
    },
    processPayoutSuccess: (state, action) => {
      state.isProcessing = false;
      state.lastProcessedPayout = action.payload;
      state.successMessage = action.payload?.message || "Payout processed successfully.";
      state.error = null;

      // Local State Update: Processed transaction ko list se remove karna
      // (Agar backend array bhej raha ho jisme processed transactionId ho)
      const processedTxId = action.payload?.transactionId;
      if (processedTxId) {
        state.payoutRequests = state.payoutRequests.filter(
          (req) => req.transactionId !== processedTxId
        );
      }
    },
    processPayoutFailure: (state, action) => {
      state.isProcessing = false;
      state.error = action.payload || "Failed to process payout.";
      state.successMessage = null;
    },

    // ----------------------------------------------------
    //  3. UTILITY RESETS
    // ----------------------------------------------------
    resetPayoutToast: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetPayoutState: () => initialState,
  },
});

export const {
  fetchRequestsStart,
  fetchRequestsSuccess,
  fetchRequestsFailure,
  processPayoutStart,
  processPayoutSuccess,
  processPayoutFailure,
  resetPayoutToast,
  resetPayoutState,
} = adminPayoutSlice.actions;

export default adminPayoutSlice.reducer;