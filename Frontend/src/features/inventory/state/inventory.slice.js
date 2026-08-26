import { createSlice } from "@reduxjs/toolkit";

/**
 * Initial State for the Inventory Slice
 */
const initialState = {
  items: [],              // List of all inventory items
  selectedItem: null,     // Currently focused/viewed inventory item
  loading: false,         // Global loading state for inventory operations
  error: null,            // Global error message string
  lastUpdated: null,      // Timestamp of the last state update
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    // Set loading indicator
    setInventoryLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error message and reset loading
    setInventoryError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear active error state
    clearInventoryError: (state) => {
      state.error = null;
    },

    // Set full inventory list
    setInventoryItems: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
      state.lastUpdated = Date.now();
    },

    // Set single selected inventory item
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Update single item stock directly in Redux store (after Purchase or Deduct)
    updateItemStockSuccess: (state, action) => {
      const updatedItem = action.payload;

      // 1. Update in items list if it exists
      const index = state.items.findIndex(
        (item) => item._id === updatedItem._id
      );
      if (index !== -1) {
        state.items[index] = updatedItem;
      }

      // 2. Update selectedItem if it matches the updated item
      if (state.selectedItem && state.selectedItem._id === updatedItem._id) {
        state.selectedItem = updatedItem;
      }

      state.loading = false;
      state.error = null;
      state.lastUpdated = Date.now();
    },

    // Reset inventory state (useful on logout or component unmount)
    resetInventoryState: () => initialState,
  },
});

export const {
  setInventoryLoading,
  setInventoryError,
  clearInventoryError,
  setInventoryItems,
  setSelectedItem,
  updateItemStockSuccess,
  resetInventoryState,
} = inventorySlice.actions;

export default inventorySlice.reducer;