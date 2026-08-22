import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: {
    items: [],
    totalAmount: 0,
    totalPV: 0,
  },
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.cart = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearCartState: (state) => {
      state.cart = initialState.cart;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const { setCart, setLoading, setError, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;