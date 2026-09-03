import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  balances: {
    availableBalance: 0,
    totalEarnings: 0,
    totalWithdrawn: 0,
    pendingPayout: 0,
  },
  earningsBreakdown: {
    binaryMatchingBonus: 0,
    directReferralBonus: 0,
  },
  payoutEligibility: {
    isKycApproved: false,
    hasConfiguredBank: false,
    hasPendingWithdrawal: false,
    isWithdrawalDayAllowed: false,
    canWithdraw: false,
    allowedWithdrawalDays: [5, 20],
    minWithdrawalAmount: 500,
    actionRequiredMessage: null,
  },
  payoutDestination: {
    kycStatus: "Pending",
    bankDetails: null,
  },
  recentTransactions: [],
  loading: false,
  error: null,
  successMessage: null,
};

const agentWalletSlice = createSlice({
  name: "agentWallet",
  initialState,
  reducers: {
    setWalletLoading: (state, action) => {
      state.loading = action.payload;
    },
    setWalletData: (state, action) => {
      const {
        balances,
        earningsBreakdown,
        payoutEligibility,
        payoutDestination,
        recentTransactions,
      } = action.payload;

      state.balances = balances || state.balances;
      state.earningsBreakdown = earningsBreakdown || state.earningsBreakdown;
      state.payoutEligibility = payoutEligibility || state.payoutEligibility;
      state.payoutDestination = payoutDestination || state.payoutDestination;
      state.recentTransactions = recentTransactions || [];
      state.loading = false;
      state.error = null;
    },
    // New Action: Immediate Sync after successful Withdrawal Request
    recordWithdrawalSuccess: (state, action) => {
      const { amount, remainingWalletBalance, pendingPayout, transaction } =
        action.payload;

      // Update Balances
      if (typeof remainingWalletBalance === "number") {
        state.balances.availableBalance = remainingWalletBalance;
      } else {
        state.balances.availableBalance -= amount;
      }

      if (typeof pendingPayout === "number") {
        state.balances.pendingPayout = pendingPayout;
      } else {
        state.balances.pendingPayout += amount;
      }

      // Lock Eligibility
      state.payoutEligibility.hasPendingWithdrawal = true;
      state.payoutEligibility.canWithdraw = false;
      state.payoutEligibility.actionRequiredMessage =
        "You already have a pending withdrawal request in process.";

      // Prepend recent transaction if returned from server
      if (transaction) {
        state.recentTransactions.unshift(transaction);
      }

      state.loading = false;
      state.error = null;
      state.successMessage =
        "Withdrawal request submitted successfully. Admin verification pending.";
    },
    setWalletError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearWalletMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetWalletState: () => initialState,
  },
});

export const {
  setWalletLoading,
  setWalletData,
  recordWithdrawalSuccess,
  setWalletError,
  clearWalletMessages,
  resetWalletState,
} = agentWalletSlice.actions;

export default agentWalletSlice.reducer;