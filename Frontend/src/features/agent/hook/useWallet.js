import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAgentWalletData } from "../service/agent.api"; // Adjust path as needed
import {
  setWalletLoading,
  setWalletData,
  setWalletError,
  clearWalletMessages,
} from "../state/agentWallet.slice"; // Adjust path as needed

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
   * @param {boolean} forceRefresh - If true, adds cache buster query parameter
   */
  const fetchWalletDetails = useCallback(
    async (forceRefresh = false) => {
      dispatch(setWalletLoading(true));
      try {
        const response = await getAgentWalletData(forceRefresh);

        if (response?.success && response?.data) {
          dispatch(setWalletData(response.data));
          return { success: true, data: response.data };
        } else {
          const errMsg = response?.message || "Failed to load wallet details.";
          dispatch(setWalletError(errMsg));
          return { success: false, error: errMsg };
        }
      } catch (err) {
        const errMsg =
          err.response?.data?.message || err.message || "Network error fetching wallet.";
        dispatch(setWalletError(errMsg));
        return { success: false, error: errMsg };
      }
    },
    [dispatch]
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

    // Action Handlers
    fetchWalletDetails,
    resetWalletToast,
  };
};

export default useWallet;