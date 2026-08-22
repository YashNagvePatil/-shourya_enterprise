import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  success: false,
  error: null,
  paymentData: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setPaymentStart: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    setPaymentSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.paymentData = action.payload;
    },
    setPaymentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },
    resetPaymentState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.paymentData = null;
    },
  },
});

export const {
  setPaymentStart,
  setPaymentSuccess,
  setPaymentFailure,
  resetPaymentState,
} = paymentSlice.actions;

export default paymentSlice.reducer;