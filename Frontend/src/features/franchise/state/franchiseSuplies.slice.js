import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  requests: [],
  selectedRequest: null,
  filters: {
    status: "ALL", // 'ALL' | 'PENDING' | 'FULFILLED' | 'CANCELLED'
    search: "",
  },
};

const franchiseSuppliesSlice = createSlice({
  name: "franchiseSupplies",
  initialState,
  reducers: {
    // 1. Set full requests array from API
    setSupplyRequests: (state, action) => {
      state.requests = action.payload;
    },

    // 2. Add new supply request at top (Unshift)
    addSupplyRequest: (state, action) => {
      state.requests.unshift(action.payload);
    },

    // 3. Update status & notes of a specific request
    updateSupplyRequestStatus: (state, action) => {
      const { requestId, status, adminNotes } = action.payload;

      const request = state.requests.find((req) => req._id === requestId);
      if (request) {
        request.status = status;
        if (adminNotes !== undefined) {
          request.adminNotes = adminNotes;
        }
      }

      if (state.selectedRequest && state.selectedRequest._id === requestId) {
        state.selectedRequest.status = status;
        if (adminNotes !== undefined) {
          state.selectedRequest.adminNotes = adminNotes;
        }
      }
    },

    // 4. Set currently selected request object
    setSelectedSupplyRequest: (state, action) => {
      state.selectedRequest = action.payload;
    },

    // 5. Update filter object
    setSupplyFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // 6. Reset state to initial state
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

// --- Pure Selectors (Direct State Readers) ---
export const selectAllSupplyRequests = (state) => state.franchiseSupplies.requests;
export const selectSelectedSupplyRequest = (state) => state.franchiseSupplies.selectedRequest;
export const selectSupplyFilters = (state) => state.franchiseSupplies.filters;

export default franchiseSuppliesSlice.reducer;