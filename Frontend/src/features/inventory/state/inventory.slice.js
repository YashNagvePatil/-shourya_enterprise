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

  // --- Recent Updates ke liye naye fields ---

  // Purchase/Deduct operation ka status: null | "purchase_success" | "deduct_success" | "insufficient_stock"
  // UI toast/notification dikhane ke liye use karo
  operationStatus: null,

  // Jab getInventoryItem 404 return kare (product hai par inventory nahi)
  // Backend ab productInfo bhejtaa hai — "Please purchase stock first" wala case
  notFoundProductInfo: null,

  // Purchase ya Deduct successfully complete hone ka flag
  // Form reset aur modal close karne ke liye use karo
  stockOperationSuccess: false,
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

    // Purchase ya Deduct complete hone par operation type set karo
    // payload: "purchase_success" | "deduct_success"
    // UI mein toast/notification dikhane ke liye dispatch karo
    stockOperationCompleted: (state, action) => {
      state.operationStatus = action.payload; // "purchase_success" | "deduct_success"
      state.stockOperationSuccess = true;
      state.loading = false;
      state.error = null;
    },

    // getInventoryItem 404 case: product exist karta hai par inventory nahi
    // Backend { productInfo: { _id, name, sku, currentProductStock } } bhejtaa hai
    setNotFoundProductInfo: (state, action) => {
      state.notFoundProductInfo = action.payload; // productInfo object store karo
      state.selectedItem = null;
      state.loading = false;
    },

    // Success flags reset karo (toast dikhane ke baad call karo)
    resetStockOperation: (state) => {
      state.operationStatus = null;
      state.stockOperationSuccess = false;
      state.notFoundProductInfo = null;
      state.error = null;
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
  stockOperationCompleted,
  setNotFoundProductInfo,
  resetStockOperation,
  resetInventoryState,
} = inventorySlice.actions;

export default inventorySlice.reducer;