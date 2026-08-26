import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  status: "Pending", // 'idle' | 'active' | 'pending' | 'blocked'
};

const franchiseUserSlice = createSlice({
  name: "franchiseUser",
  initialState,
  reducers: {
    setFranchiseUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.status = action.payload?.status || "active";
    },
    updateFranchiseProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateWalletBalance: (state, action) => {
      if (state.user && state.user.wallet) {
        state.user.wallet = { ...state.user.wallet, ...action.payload };
      }
    },
    clearFranchiseUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = "idle";
    },
  },
});

export const {
  setFranchiseUser,
  updateFranchiseProfile,
  updateWalletBalance,
  clearFranchiseUser,
} = franchiseUserSlice.actions;

export const selectFranchiseUser = (state) => state.franchiseUser.user;
export const selectIsAuthenticated = (state) => state.franchiseUser.isAuthenticated;
export const selectUserStatus = (state) => state.franchiseUser.status;

export default franchiseUserSlice.reducer;