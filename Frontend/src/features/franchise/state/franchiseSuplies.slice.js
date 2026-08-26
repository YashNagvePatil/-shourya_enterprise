import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  requests: [],
  selectedRequest: null,
  filters: {
    status: "ALL", // 'ALL' | 'Pending' | 'Approved' | 'Dispatched' | 'Delivered' | 'Rejected'
    search: "",
  },
};

const franchiseSuppliesSlice = createSlice({
  name: "franchiseSupplies",
  initialState,
  reducers: {
    setSupplyRequests: (state, action) => {
      state.requests = action.payload;
    },
    addSupplyRequest: (state, action) => {
      state.requests.unshift(action.payload);
    },
    updateSupplyRequestStatus: (state, action) => {
      const { requestId, status } = action.payload;
      const index = state.requests.findIndex((req) => req._id === requestId);
      if (index !== -1) {
        state.requests[index].status = status;
      }
      if (state.selectedRequest && state.selectedRequest._id === requestId) {
        state.selectedRequest.status = status;
      }
    },
    setSelectedSupplyRequest: (state, action) => {
      state.selectedRequest = action.payload;
    },
    setSupplyFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSupplyState: () => initialState,
  },
});

export const {
  setSupplyRequests,
  addSupplyRequest,
  updateSupplyRequestStatus,
  setSelectedSupplyRequest,
  setSupplyFilters,
  clearSupplyState,
} = franchiseSuppliesSlice.actions;

export const selectAllSupplyRequests = (state) => state.franchiseSupplies.requests;
export const selectSelectedSupplyRequest = (state) => state.franchiseSupplies.selectedRequest;
export const selectSupplyFilters = (state) => state.franchiseSupplies.filters;

export default franchiseSuppliesSlice.reducer;