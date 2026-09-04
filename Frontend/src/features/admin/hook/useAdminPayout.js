import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  processPayout as processPayoutApi,
  getPayoutRequests as getPayoutRequestsApi,
} from "../service/admin.api"; // Adjust path as per your project
import {
  fetchRequestsStart,
  fetchRequestsSuccess,
  fetchRequestsFailure,
  processPayoutStart,
  processPayoutSuccess,
  processPayoutFailure,
  resetPayoutToast,
  resetPayoutState,
} from "../state/adminPayoutSlice"; // Adjust path as per your project

export const useAdminPayout = () => {
  const dispatch = useDispatch();

  // Extract admin payout state from Redux store
  const {
    isLoadingRequests,
    payoutRequests,
    pagination,
    isProcessing,
    successMessage,
    error,
    lastProcessedPayout,
  } = useSelector((state) => state.adminPayout);

  /**
   * Fetch all payout requests (with optional filters: status, page, limit, search)
   * @param {Object} params - Query parameters
   */
  const fetchPayoutRequestsList = useCallback(
    async (params = {}) => {
      dispatch(fetchRequestsStart());
      try {
        // Interceptor unwrap karta hai isliye 'response' direct backend payload hai
        const response = await getPayoutRequestsApi(params);

        if (response?.success) {
          dispatch(fetchRequestsSuccess(response.data));
          return { success: true, data: response.data };
        } else {
          const msg = response?.message || "Failed to fetch payout requests.";
          dispatch(fetchRequestsFailure(msg));
          return { success: false, error: msg };
        }
      } catch (err) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Error fetching payout requests.";
        dispatch(fetchRequestsFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  /**
   * Execute payout request via API service (Approve/Reject with Manual/Razorpay mode)
   * @param {Object} payoutData - { transactionId, action, rejectionReason, paymentMode }
   */
  const handleProcessPayout = useCallback(
    async (payoutData) => {
      dispatch(processPayoutStart());

      try {
        const response = await processPayoutApi(payoutData);

        if (response?.success) {
          // Pass both API response & transactionId to update Redux local list state
          dispatch(
            processPayoutSuccess({
              transactionId: payoutData.transactionId,
              message: response.message,
            })
          );
          return { success: true, data: response };
        } else {
          const msg = response?.message || "Failed to process payout request.";
          dispatch(processPayoutFailure(msg));
          return { success: false, error: msg };
        }
      } catch (err) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Error processing payout request.";
        dispatch(processPayoutFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  /**
   * Clear error and success messages from state
   */
  const clearPayoutToast = useCallback(() => {
    dispatch(resetPayoutToast());
  }, [dispatch]);

  /**
   * Reset entire payout slice state
   */
  const clearPayoutState = useCallback(() => {
    dispatch(resetPayoutState());
  }, [dispatch]);

  return {
    // States
    isLoadingRequests,
    payoutRequests,
    pagination,
    isProcessing,
    successMessage,
    error,
    lastProcessedPayout,

    // Actions & API Triggers
    fetchPayoutRequestsList,
    handleProcessPayout,
    clearPayoutToast,
    clearPayoutState,
  };
};