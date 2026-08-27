import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setError,
  setSuccessMessage,
  clearMessages,
  setFinancialSummary,
  removePendingWithdrawal,
} from "../state/manageFranchiseFinance.slice"; // Adjust path to your slice
import {
  getFinancialSummary,
  processSettlement,
} from "../service/franchiseManage.api"; // Adjust path to your API file

const useFranchiseFinancials = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.managefranchiseFinancial);

  const fetchFinancialSummary = useCallback(async () => {
    dispatch(clearMessages());
    dispatch(setLoading({ key: "summary", value: true }));
    try {
      const response = await getFinancialSummary();
      if (response.data?.success) {
        dispatch(
          setFinancialSummary({
            payouts: response.data.payouts,
            pendingWithdrawals: response.data.pendingWithdrawals,
          })
        );
      }
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to fetch financial summary";
      dispatch(setError(msg));
      throw error;
    } finally {
      dispatch(setLoading({ key: "summary", value: false }));
    }
  }, [dispatch]);

  const handleProcessSettlement = useCallback(
    async (settlementData) => {
      dispatch(clearMessages());
      dispatch(setLoading({ key: "settlement", value: true }));
      try {
        const response = await processSettlement(settlementData);
        if (response.data?.success) {
          dispatch(
            setSuccessMessage(
              response.data.message || "Settlement processed successfully"
            )
          );
          if (settlementData.franchiseId) {
            dispatch(removePendingWithdrawal(settlementData.franchiseId));
          }
          // Refresh summary to reflect updated payout metrics
          fetchFinancialSummary();
        }
        return response.data;
      } catch (error) {
        const msg =
          error.response?.data?.message || "Failed to process settlement";
        dispatch(setError(msg));
        throw error;
      } finally {
        dispatch(setLoading({ key: "settlement", value: false }));
      }
    },
    [dispatch, fetchFinancialSummary]
  );

  const resetMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  return {
    ...state,
    fetchFinancialSummary,
    handleProcessSettlement,
    resetMessages,
  };
};

export default useFranchiseFinancials;