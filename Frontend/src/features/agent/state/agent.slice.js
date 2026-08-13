import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null,
  wallet: null, // Live Wallet & Financial breakups store
  binaryStats: null, // Team counters, active counts and  left/right BVs
  treeNodes: null, // Direct child nodes (leftChild, rightChild) store
  recentDownlines: [],
  loading: false,
  error: null,
};

const agentSlice = createSlice({
  name: "agent",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // 1. DASHBOARD OVERVIEW REDUCER (Existing layout data sync )
    setDashboardData: (state, action) => {
      state.loading = false;
      state.error = null;
      const data = action.payload?.dashboard || action.payload;
      if (data) {
        state.profile = data.profile || null;
        state.wallet = data.wallet || null;
        state.binaryStats = data.binaryStats || null;
        state.treeNodes = data.treeNodes || null;
        state.recentDownlines = data.recentDownlines || [];
      }
    },

    // 2. NEW: WALLET DETAILS REDUCER (for getWalletDetails API ke )
    setWalletDetails: (state, action) => {
      state.loading = false;
      state.error = null;

      const payloadData = action.payload;
      if (payloadData) {
        // API response ke mapping ke mutabik state updates
        state.wallet = {
          balances: payloadData.balances,
          earningsBreakdown: payloadData.earningsBreakdown,
          payoutDestination: payloadData.payoutDestination,
        };
      }
    },

    // 3. NEW: WITHDRAWAL SUCCESS REDUCER (Paisa nikalne ke baad real-time updates)
    updateWalletBalances: (state, action) => {
      // Jab user requestWithdrawal hit karega, toh live update dikhane ke liye
      if (state.wallet && action.payload?.updatedBalances) {
        state.wallet.balances.availableBalance =
          action.payload.updatedBalances.availableBalance;
        state.wallet.balances.pendingPayout =
          action.payload.updatedBalances.pendingPayout;
      }
    },

    // 4. NEW: NETWORK TREE REDUCER (for netWorkTree API)
    // inside your slice actions
    setNetworkTree: (state, action) => {
      state.treeNodes = action.payload.treeNodes;
      state.binaryStats = action.payload.binaryStats;
      state.loading = false;
      state.error = null;
    },

    clearAgentState: (state) => {
      state.profile = null;
      state.wallet = null;
      state.binaryStats = null;
      state.treeNodes = null;
      state.recentDownlines = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setDashboardData,
  setError,
  setWalletDetails,
  updateWalletBalances,
  setNetworkTree,
  clearAgentState,
} = agentSlice.actions;

export default agentSlice.reducer;
