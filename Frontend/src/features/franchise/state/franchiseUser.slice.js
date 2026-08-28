import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentFranchise: null,
  isAuthenticated: false, // Tracks authentication state for login
  isRegisteredSuccess: false,
  registeredFranchiseId: null,
  loading: false,
  error: null,
};

const franchiseSlice = createSlice({
  name: "franchise",
  initialState,
  reducers: {
    // --- Common / Async Loading & Error Handling ---
    setFranchiseLoading: (state, action) => {
      state.loading = action.payload;
    },
    setFranchiseError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearFranchiseError: (state) => {
      state.error = null;
    },

    // --- Registration Handlers ---
    registrationSuccess: (state, action) => {
      state.isRegisteredSuccess = true;
      state.registeredFranchiseId = action.payload?.franchiseId || null;
      state.loading = false;
      state.error = null;
    },
    resetRegistrationState: (state) => {
      state.isRegisteredSuccess = false;
      state.registeredFranchiseId = null;
      state.error = null;
      state.loading = false;
    },

    // --- Login & Authentication Handlers ---
    loginSuccess: (state, action) => {
      state.currentFranchise = action.payload?.franchise || action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    logoutSuccess: (state) => {
      state.currentFranchise = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },

    // --- Profile / General Updates ---
    setCurrentFranchise: (state, action) => {
      state.currentFranchise = action.payload;
      state.isAuthenticated = Boolean(action.payload);
      state.loading = false;
      state.error = null;
    },

    // Full Reset
    resetFranchiseState: () => initialState,
  },
});

export const {
  setFranchiseLoading,
  setFranchiseError,
  clearFranchiseError,
  registrationSuccess,
  resetRegistrationState,
  loginSuccess,
  logoutSuccess,
  setCurrentFranchise,
  resetFranchiseState,
} = franchiseSlice.actions;

export default franchiseSlice.reducer;