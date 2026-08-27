import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pendingApplications: [],
  totalPending: 0,
  currentPage: 1,
  hierarchy: [],
  hierarchyCount: 0,
  loading: {
    pending: false,
    review: false,
    hierarchy: false,
    statusUpdate: false,
  },
  error: null,
  successMessage: null,
};

const franchiseManageSlice = createSlice({
  name: "franchiseManageKyc",
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
    setPendingApplications: (state, action) => {
      state.pendingApplications = action.payload.applications;
      state.totalPending = action.payload.total;
      state.currentPage = action.payload.page;
    },
    removePendingApplication: (state, action) => {
      state.pendingApplications = state.pendingApplications.filter(
        (app) => app._id !== action.payload
      );
      state.totalPending = Math.max(0, state.totalPending - 1);
    },
    setHierarchy: (state, action) => {
      state.hierarchy = action.payload.hierarchy;
      state.hierarchyCount = action.payload.count;
    },
    updateHierarchyStatus: (state, action) => {
      const { franchiseId, status } = action.payload;
      const index = state.hierarchy.findIndex(
        (item) => item._id === franchiseId
      );
      if (index !== -1) {
        state.hierarchy[index].status = status;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setSuccessMessage,
  clearMessages,
  setPendingApplications,
  removePendingApplication,
  setHierarchy,
  updateHierarchyStatus,
} = franchiseManageSlice.actions;

export default franchiseManageSlice.reducer;