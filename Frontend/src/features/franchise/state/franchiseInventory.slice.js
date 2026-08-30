import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  selectedItem: null,
  filters: {
    category: "ALL",
    stockStatus: "ALL", // 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
    searchQuery: "",
  },
};

const franchiseInventorySlice = createSlice({
  name: "franchiseInventory",
  initialState,
  reducers: {
    setInventory: (state, action) => {
      state.items = action.payload;
    },

    addInventoryItem: (state, action) => {
      state.items.push(action.payload);
    },

    updateInventoryStock: (state, action) => {
      const { productId, quantitySold } = action.payload;

      // Safe identification of items whether productId is populated or raw ObjectId string
      const item = state.items.find((i) => {
        const prodId = i.productId?._id || i.productId || i.product?._id || i.product || i._id;
        return prodId.toString() === productId.toString();
      });

      if (item) {
        const currentStock = item.stock ?? item.quantity ?? 0;
        const newStock = Math.max(0, currentStock - Number(quantitySold));
        
        if (item.stock !== undefined) {
          item.stock = newStock;
        } else {
          item.quantity = newStock;
        }
      }
    },

    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },

    setInventoryFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearInventoryState: () => initialState,
  },
});

export const {
  setInventory,
  addInventoryItem,
  updateInventoryStock,
  setSelectedItem,
  setInventoryFilters,
  clearInventoryState,
} = franchiseInventorySlice.actions;

export const selectInventoryItems = (state) => state.franchiseInventory.items;
export const selectSelectedItem = (state) => state.franchiseInventory.selectedItem;
export const selectInventoryFilters = (state) => state.franchiseInventory.filters;

export default franchiseInventorySlice.reducer;