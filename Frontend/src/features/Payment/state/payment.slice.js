import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  success: false,
  error: null,
  orderData: null,         // Step 1: Razorpay Order Creation response (orderId, dbOrderId, keyId)
  verificationData: null,  // Step 2: Signature Verification & MLM distribution response
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
    // Step 1 Success (Create Order)
    setOrderSuccess: (state, action) => {
      state.loading = false;
      state.orderData = action.payload;
    },
    // Step 2 Success (Verify & Distribute MLM)
    setPaymentSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.verificationData = action.payload;
    },
    setPaymentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },
    resetPaymentState: () => initialState, // Clean reset using initialState
  },
});

export const {
  setPaymentStart,
  setOrderSuccess,
  setPaymentSuccess,
  setPaymentFailure,
  resetPaymentState,
} = paymentSlice.actions;

export default paymentSlice.reducer;