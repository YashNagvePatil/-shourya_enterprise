import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAgentWalletData, withdrawalRequests } from "../service/agent.api";
import {
  setWalletLoading,
  setWalletData,
  recordWithdrawalSuccess,
  setWalletError,
  clearWalletMessages,
} from "../state/agentWallet.slice";

export const useWallet = () => {
  const dispatch = useDispatch();

  // Extract wallet state from Redux store
  const {
    balances,
    earningsBreakdown,
    payoutEligibility,
    payoutDestination,
    recentTransactions,
    loading,
    error,
    successMessage,
  } = useSelector((state) => state.agentWallet);

  /**
   * Fetch latest wallet, balances, eligibility & recent transactions
   */
  const fetchWalletDetails = useCallback(async () => {
    dispatch(setWalletLoading(true));
    try {
      // Axios interceptor handle timestamp / params automatically
      const response = await getAgentWalletData();

      if (response?.success && response?.data) {
        dispatch(setWalletData(response.data));
        return { success: true, data: response.data };
      } else {
        const errMsg = response?.message || "Failed to load wallet details.";
        dispatch(setWalletError(errMsg));
        return { success: false, error: errMsg };
      }
    } catch (err) {
      const errMsg = err.message || "Network error fetching wallet.";
      dispatch(setWalletError(errMsg));
      return { success: false, error: errMsg };
    }
  }, [dispatch]);

  /**
   * Submit Withdrawal Request
   * @param {number|string} amount
   */
  const submitWithdrawalRequest = useCallback(
    async (amount) => {
      const numericAmount = Number(amount);

      // Basic Client Validations
      if (!numericAmount || numericAmount <= 0) {
        const errMsg = "Please enter a valid withdrawal amount.";
        dispatch(setWalletError(errMsg));
        return { success: false, error: errMsg };
      }

      const minLimit = payoutEligibility?.minWithdrawalAmount || 500;
      if (numericAmount < minLimit) {
        const errMsg = `Minimum withdrawal amount is ₹${minLimit}.`;
        dispatch(setWalletError(errMsg));
        return { success: false, error: errMsg };
      }

      if (numericAmount > balances.availableBalance) {
        const errMsg = "Insufficient wallet balance.";
        dispatch(setWalletError(errMsg));
        return { success: false, error: errMsg };
      }

      dispatch(setWalletLoading(true));
      try {
        const response = await withdrawalRequests({ amount: numericAmount });

        if (response?.success) {
          dispatch(
            recordWithdrawalSuccess({
              amount: numericAmount,
              remainingWalletBalance: response.data?.remainingWalletBalance,
              pendingPayout: response.data?.pendingPayout,
              transaction: response.data?.transaction,
            })
          );
          return { success: true, message: response.message, data: response.data };
        } else {
          const errMsg = response?.message || "Failed to submit withdrawal request.";
          dispatch(setWalletError(errMsg));
          return { success: false, error: errMsg };
        }
      } catch (err) {
        const errMsg = err.message || "Error processing withdrawal request.";
        dispatch(setWalletError(errMsg));
        return { success: false, error: errMsg };
      }
    },
    [dispatch, balances.availableBalance, payoutEligibility]
  );

  /**
   * Clear error or notification banners
   */
  const resetWalletToast = useCallback(() => {
    dispatch(clearWalletMessages());
  }, [dispatch]);

  return {
    // Core State Properties
    balances,
    earningsBreakdown,
    payoutEligibility,
    payoutDestination,
    recentTransactions,
    isLoading: loading,
    error,
    successMessage,

    // Helper Flags & Rules (Direct UX Utilities)
    canWithdraw: payoutEligibility?.canWithdraw || false,
    isWithdrawalDayAllowed: payoutEligibility?.isWithdrawalDayAllowed || false,
    actionRequiredMessage: payoutEligibility?.actionRequiredMessage || null,
    allowedWithdrawalDays: payoutEligibility?.allowedWithdrawalDays || [5, 20],
    minWithdrawalAmount: payoutEligibility?.minWithdrawalAmount || 500,

    // Action Handlers
    fetchWalletDetails,
    submitWithdrawalRequest,
    resetWalletToast,
  };
};

export default useWallet;