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
   
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

   
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

  
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
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

export const { setLoading, setDashboardData, setError, clearAgentState } = agentSlice.actions;
export default agentSlice.reducer;