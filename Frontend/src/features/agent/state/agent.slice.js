import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null,
  wallet: null,
  binaryStats: null,
  treeNodes: null,
  recentDownlines: [],
  loading: false,
  error: null,
};

const agentSlice = createSlice({
  name: "agent",
  initialState,
  reducers: {
    // Loading start hone par
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // API se data milne par Redux state update karein
    setDashboardData: (state, action) => {
      state.loading = false;
      state.error = null;
      state.profile = action.payload.profile;
      state.wallet = action.payload.wallet;
      state.binaryStats = action.payload.binaryStats;
      state.treeNodes = action.payload.treeNodes;
      state.recentDownlines = action.payload.recentDownlines;
    },

    // Error aane par
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // State reset/clear karne ke liye
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

export const { setLoading, setDashboardData, setError, clearAgentState } = agentSlice.actions;
export default agentSlice.reducer;