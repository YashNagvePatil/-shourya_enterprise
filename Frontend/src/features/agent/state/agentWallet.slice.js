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
  setWalletError,
  clearWalletMessages,
  resetWalletState,
} = agentWalletSlice.actions;

export default agentWalletSlice.reducer;