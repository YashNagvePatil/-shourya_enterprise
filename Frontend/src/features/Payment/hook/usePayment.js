import { useDispatch, useSelector } from "react-redux";
import {
  createRazorpayOrder,
  verifyAndDistributeMLM,
} from "../service/payment.api"; 
import {
  setPaymentStart,
  setPaymentSuccess,
  setPaymentFailure,
  resetPaymentState,
} from "../state/payment.slice";

// Dynamically load Razorpay SDK Script into the DOM
const loadRazorpaySDK = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const usePayment = () => {
  const dispatch = useDispatch();
  const { loading, success, error, paymentData } = useSelector(
    (state) => state.payment
  );

  /**
   * @param {Object} cartPayload - { productId, quantity, amount }
   * @param {Object} userDetails - Optional { name, email, phone } for prefilling Checkout modal
   */
  const executePayment = async (cartPayload, userDetails = {}) => {
    dispatch(setPaymentStart());

    try {
      // 1. Check & Load Razorpay SDK
      const isSDKLoaded = await loadRazorpaySDK();
      if (!isSDKLoaded) {
        const sdkErr = "Razorpay SDK failed to load. Check network connection.";
        dispatch(setPaymentFailure(sdkErr));
        return { success: false, message: sdkErr };
      }

      // 2. Step 1 API Call: Create Order on Backend & Razorpay
      console.log("🚀 [usePayment] Creating Razorpay Order with:", cartPayload);
      
      // Axios response interceptor directly unwraps response.data
      const orderResponse = await createRazorpayOrder(cartPayload);
      const { razorpayOrderId, amount, currency, dbOrderId, keyId } = orderResponse;

      // 3. Open Razorpay Checkout Modal
      return new Promise((resolve) => {
        const options = {
          key: keyId,
          amount: amount,
          currency: currency || "INR",
          name: "Shourya Enterprise",
          description: "Order Payment & MLM Distribution",
          order_id: razorpayOrderId,
          prefill: {
            name: userDetails.name || "",
            email: userDetails.email || "",
            contact: userDetails.phone || "",
          },
          handler: async (response) => {
            try {
              // 4. Step 2 API Call: Verify Signature & Distribute MLM Points
              console.log("🔒 [usePayment] Verifying Payment Signature...");
              
              const verificationResult = await verifyAndDistributeMLM({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: dbOrderId,
              });

              dispatch(setPaymentSuccess(verificationResult));
              resolve({ success: true, data: verificationResult });
            } catch (verificationErr) {
              const verifyErrMsg = verificationErr.message || "Payment verification failed";
              console.error("❌ [usePayment Verification Error]:", verifyErrMsg);
              dispatch(setPaymentFailure(verifyErrMsg));
              resolve({ success: false, message: verifyErrMsg });
            }
          },
          modal: {
            ondismiss: () => {
              const dismissMsg = "Payment popup closed by user.";
              console.warn("⚠️ [usePayment] Modal Dismissed");
              dispatch(setPaymentFailure(dismissMsg));
              resolve({ success: false, message: dismissMsg });
            },
          },
          theme: {
            color: "#DC2643", // Primary theme color matching Cart UI
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    } catch (err) {
      const errorMessage = err.message || "Order creation failed";
      console.error("❌ [usePayment Error]:", errorMessage);
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