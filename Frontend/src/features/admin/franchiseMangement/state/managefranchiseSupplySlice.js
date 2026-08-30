import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  requests: [],
  count: 0,
  selectedRequest: null, // Specific request view karne ke liye
  filters: {
    status: "ALL",
    search: "",
    page: 1,
  },
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
      // Backend structured response array & count sync
      state.requests = action.payload.requests || action.payload.data?.requests || [];
      state.count = action.payload.count || action.payload.data?.count || 0;
    },
    updateSupplyRequest: (state, action) => {
      const updatedReq = action.payload;
      const index = state.requests.findIndex(
        (req) => req._id === updatedReq._id
      );
      if (index !== -1) {
        state.requests[index] = { ...state.requests[index], ...updatedReq };
      }
      if (state.selectedRequest?._id === updatedReq._id) {
        state.selectedRequest = { ...state.selectedRequest, ...updatedReq };
      }
    },
    setSelectedRequest: (state, action) => {
      state.selectedRequest = action.payload;
    },
    setSupplyFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetSupplyState: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  setSuccessMessage,
  clearMessages,
  setSupplyRequests,
  updateSupplyRequest,
  setSelectedRequest,
  setSupplyFilters,
  resetSupplyState,
} = franchiseSupplySlice.actions;

export default franchiseSupplySlice.reducer;