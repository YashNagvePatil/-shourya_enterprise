import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentFranchise: null,
  isRegisteredSuccess: false,
  registeredFranchiseId: null,
  loading: false,
  error: null,
};

const franchiseSlice = createSlice({
  name: "franchise",
  initialState,
  reducers: {
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
    setCurrentFranchise: (state, action) => {
      state.currentFranchise = action.payload;
      state.loading = false;
      state.error = null;
    },
    resetFranchiseState: () => initialState,
  },
});

export const {
  setFranchiseLoading,
  setFranchiseError,
  clearFranchiseError,
  registrationSuccess,
  resetRegistrationState,
  setCurrentFranchise,
  resetFranchiseState,
} = franchiseSlice.actions;

export default franchiseSlice.reducer;