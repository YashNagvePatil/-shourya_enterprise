import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profileData: null,
  kycData: null,
  bankDetails: null,
  address: null,
  loading: false,
  updating: false,
  error: null,
  successMessage: null,
};

const agentProfileSlice = createSlice({
  name: "agentProfile",
  initialState,
  reducers: {
    // Basic Loading & Error Handlers
    setProfileLoading: (state, action) => {
      state.loading = action.payload;
    },
    setProfileUpdating: (state, action) => {
      state.updating = action.payload;
    },
    setProfileError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.updating = false;
    },
    clearProfileMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },

    // 1. Fetch Profile Data Success
    setProfileData: (state, action) => {
      const payload = action.payload;
      state.profileData = payload;
      state.kycData = {
        kycStatus: payload?.kycStatus || "Pending",
        panCardImage: payload?.panCardImage || null,
        adharCardImage: payload?.adharCardImage || null,
      };
      state.bankDetails = payload?.bankDetails || {};
      state.address = payload?.address || {};
      state.loading = false;
      state.error = null;
    },

    // 2. Update Profile & Address Success
    updateProfileSuccess: (state, action) => {
      state.profileData = { ...state.profileData, ...action.payload };
      if (action.payload?.address) {
        state.address = action.payload.address;
      }
      state.updating = false;
      state.error = null;
      state.successMessage = "Profile updated successfully";
    },

    // 3. Update KYC Success
    updateKYCSuccess: (state, action) => {
      state.kycData = {
        ...state.kycData,
        ...action.payload,
      };
      if (state.profileData) {
        state.profileData.kycStatus = action.payload.kycStatus || state.profileData.kycStatus;
        state.profileData.panCardImage = action.payload.panCardImage || state.profileData.panCardImage;
        state.profileData.adharCardImage = action.payload.adharCardImage || state.profileData.adharCardImage;
      }
      state.updating = false;
      state.error = null;
      state.successMessage = "KYC documents submitted successfully";
    },

    // 4. Update Bank Details Success
    updateBankDetailsSuccess: (state, action) => {
      state.bankDetails = action.payload;
      if (state.profileData) {
        state.profileData.bankDetails = action.payload;
      }
      state.updating = false;
      state.error = null;
      state.successMessage = "Bank details updated successfully";
    },

    // Reset State (Useful for Logout)
    resetProfileState: () => initialState,
  },
});

export const {
  setProfileLoading,
  setProfileUpdating,
  setProfileError,
  clearProfileMessages,
  setProfileData,
  updateProfileSuccess,
  updateKYCSuccess,
  updateBankDetailsSuccess,
  resetProfileState,
} = agentProfileSlice.actions;

export default agentProfileSlice.reducer;