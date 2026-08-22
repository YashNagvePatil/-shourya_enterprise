import { useDispatch, useSelector } from "react-redux";
import { createPayment as paymentApiCall } from "../service/payment.api";
import {
  setPaymentStart,
  setPaymentSuccess,
  setPaymentFailure,
  resetPaymentState,
} from "../state/payment.slice";

export const usePayment = () => {
  // 24-Character Hexadecimal MongoDB ObjectId Validation Regex
  const isValidObjectId = (id) =>
    typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

  const dispatch = useDispatch();
  const { loading, success, error, paymentData } = useSelector(
    (state) => state.payment
  );

  const executePayment = async (orderIdInput) => {
    console.log("🔍 [usePayment Debug] Received input:", orderIdInput);

    let orderId = orderIdInput;

    // 1. Extraction Logic (If object was passed accidentally)
    if (typeof orderIdInput === "object" && orderIdInput !== null) {
      orderId = orderIdInput.orderId || orderIdInput._id || orderIdInput.id;
    } else if (orderIdInput) {
      orderId = String(orderIdInput).trim();
    }

    console.log("🔍 [usePayment Debug] Extracted orderId string:", orderId);

    // 2. Dummy Fallback Logic for Testing
    const DUMMY_TEST_OBJECT_ID = "65f1a2b3c4d5e6f7a8b9c0d1";

    if (!isValidObjectId(orderId)) {
      console.warn(
        `⚠️ [usePayment Debug] Invalid or missing Order ID ("${orderId}"). Fallback to testing Dummy ObjectId: ${DUMMY_TEST_OBJECT_ID}`
      );
      orderId = DUMMY_TEST_OBJECT_ID;
    }

    try {
      dispatch(setPaymentStart());
      console.log("🚀 [usePayment Debug] Hitting API with orderId:", orderId);

      const data = await paymentApiCall(orderId);

      dispatch(setPaymentSuccess(data));
      return { success: true, data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Payment processing failed";
      console.error("❌ [usePayment Debug] API Error:", errorMessage);

      dispatch(setPaymentFailure(errorMessage));
      return { success: false, message: errorMessage };
    }
  };

  const clearPayment = () => {
    dispatch(resetPaymentState());
  };

  return {
    loading,
    success,
    error,
    paymentData,
    executePayment,
    clearPayment,
  };
};