import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  requests: [],
  count: 0,
  loading: {
    fetch: false,
    update: false,
  },
  error: null,
  successMessage: null,
};

const franchiseSupplySlice = createSlice({
  name: "ManagefranchiseSupply",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSupplyRequests: (state, action) => {
      state.requests = action.payload.requests;
      state.count = action.payload.count;
    },
    updateSupplyRequest: (state, action) => {
      const updatedReq = action.payload;
      const index = state.requests.findIndex(
        (req) => req._id === updatedReq._id
      );
      if (index !== -1) {
        state.requests[index] = { ...state.requests[index], ...updatedReq };
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setSuccessMessage,
  clearMessages,
  setSupplyRequests,
  updateSupplyRequest,
} = franchiseSupplySlice.actions;

export default franchiseSupplySlice.reducer;