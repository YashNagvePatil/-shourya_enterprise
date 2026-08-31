import { createSlice } from "@reduxjs/toolkit"; 

const initialState = {
  // Data State
  profile: null,

  // Loading States
  isProfileLoading: false,
  isUpdatingProfile: false,
  isChangingPassword: false,

  // Error States
  profileError: null,
  updateError: null,
  passwordError: null,

  // Success Indicators (Notifications / Toast alerts ke liye)
  updateSuccess: false,
  passwordSuccess: false,
};

const franchiseProfileSlice = createSlice({
  name: "franchiseProfile",
  initialState,
  reducers: {
    // ---------------------- 1. GET Profile Actions ----------------------
    fetchProfileStart: (state) => {
      state.isProfileLoading = true;
      state.profileError = null;
    },
    fetchProfileSuccess: (state, action) => {
      state.isProfileLoading = false;
      state.profile = action.payload; // Payload formatted object hoga (personalInfo, outletInfo, etc.)
      state.profileError = null;
    },
    fetchProfileFailure: (state, action) => {
      state.isProfileLoading = false;
      state.profileError = action.payload;
    },

    // ---------------------- 2. UPDATE Profile Actions ----------------------
    updateProfileStart: (state) => {
      state.isUpdatingProfile = true;
      state.updateError = null;
      state.updateSuccess = false;
    },
    updateProfileSuccess: (state, action) => {
      state.isUpdatingProfile = false;
      state.updateSuccess = true;
      state.updateError = null;
      // Agar backend updated profile object bhejta hai, to state merge kar do
      if (action.payload) {
        state.profile = {
          ...state.profile,
          ...action.payload,
        };
      }
    },
    updateProfileFailure: (state, action) => {
      state.isUpdatingProfile = false;
      state.updateError = action.payload;
      state.updateSuccess = false;
    },

    // ---------------------- 3. CHANGE Password Actions ----------------------
    changePasswordStart: (state) => {
      state.isChangingPassword = true;
      state.passwordError = null;
      state.passwordSuccess = false;
    },
    changePasswordSuccess: (state) => {
      state.isChangingPassword = false;
      state.passwordSuccess = true;
      state.passwordError = null;
    },
    changePasswordFailure: (state, action) => {
      state.isChangingPassword = false;
      state.passwordError = action.payload;
      state.passwordSuccess = false;
    },

    // ---------------------- Helper Actions ----------------------
    resetProfileState: () => initialState,
    clearProfileErrors: (state) => {
      state.profileError = null;
      state.updateError = null;
      state.passwordError = null;
    },
    clearStatusFlags: (state) => {
      state.updateSuccess = false;
      state.passwordSuccess = false;
    },
  },
});

export const {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  changePasswordStart,
  changePasswordSuccess,
  changePasswordFailure,
  resetProfileState,
  clearProfileErrors,
  clearStatusFlags,
} = franchiseProfileSlice.actions;

export default franchiseProfileSlice.reducer;