import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setError,
  setSuccessMessage,
  clearMessages,
  setFinancialSummary,
  removePendingWithdrawal,
  addSettlementPayout,
  setFranchiseLedger,
  clearFranchiseLedger
} from "../state/manageFranchiseFinance.slice"; // Adjust path to your slice
import {
  getFinancialSummary,
  processSettlement,
  reviewWithdrawalRequest,
  getFranchiseFinancialLedger
} from "../service/franchiseManage.api"; // Adjust path to your API file

const useFranchiseFinancials = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.managefranchiseFinancial);

  // 1. Fetch Financial Dashboard Analytics & Summary
  const fetchFinancialSummary = useCallback(async () => {
    dispatch(clearMessages());
    dispatch(setLoading({ key: "summary", value: true }));
    try {
      const response = await getFinancialSummary();
      // Safe Data Extraction (Handles both raw Axios response & un-wrapped response.data)
      const resPayload = response?.data ? response.data : response;

      if (resPayload?.success) {
        dispatch(setFinancialSummary(resPayload.data));
      }
      return resPayload;
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to fetch financial summary";
      dispatch(setError(msg));
      throw error;
    } finally {
      dispatch(setLoading({ key: "summary", value: false }));
    }
  }, [dispatch]);

  // 2. Process Manual Financial Settlement (Rent, ROI, Commission)
  const handleProcessSettlement = useCallback(
    async (settlementData) => {
      dispatch(clearMessages());
      dispatch(setLoading({ key: "settlement", value: true }));
      try {
        const response = await processSettlement(settlementData);
        const resPayload = response?.data ? response.data : response;

        if (resPayload?.success) {
          dispatch(
            setSuccessMessage(
              resPayload.message || "Settlement processed successfully"
            )
          );

          if (resPayload.payout) {
            dispatch(addSettlementPayout(resPayload.payout));
          }

          // Refresh summary metrics to update liabilities & balances
          fetchFinancialSummary();
        }
        return resPayload;
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

  // 3. Approve or Reject Pending Withdrawal Request (NEW)
  const handleReviewWithdrawal = useCallback(
    async (requestId, reviewPayload) => {
      dispatch(clearMessages());
      dispatch(setLoading({ key: "reviewWithdrawal", value: true }));
      try {
        const response = await reviewWithdrawalRequest(requestId, reviewPayload);
        const resPayload = response?.data ? response.data : response;

        if (resPayload?.success) {
          // Remove from pending list locally in Redux store
          dispatch(removePendingWithdrawal(requestId));
          dispatch(
            setSuccessMessage(
              resPayload.message || `Withdrawal request updated successfully`
            )
          );
          // Refresh background metrics
          fetchFinancialSummary();
        }
        return resPayload;
      } catch (error) {
        const msg =
          error.response?.data?.message || "Failed to review withdrawal request";
        dispatch(setError(msg));
        throw error;
      } finally {
        dispatch(setLoading({ key: "reviewWithdrawal", value: false }));
      }
    },
    [dispatch, fetchFinancialSummary]
  );

  // 4. Fetch Specific Franchise Financial Passbook / Ledger (NEW)
  const fetchFranchiseLedger = useCallback(
    async (franchiseId) => {
      dispatch(clearMessages());
      dispatch(setLoading({ key: "ledger", value: true }));
      try {
        const response = await getFranchiseFinancialLedger(franchiseId);
        const resPayload = response?.data ? response.data : response;

        if (resPayload?.success) {
          dispatch(setFranchiseLedger(resPayload.data));
        }
        return resPayload;
      } catch (error) {
        const msg =
          error.response?.data?.message || "Failed to fetch franchise ledger";
        dispatch(setError(msg));
        throw error;
      } finally {
        dispatch(setLoading({ key: "ledger", value: false }));
      }
    },
    [dispatch]
  );

  // 5. Clear Passbook Data / Messages
  const resetMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const resetFranchiseLedger = useCallback(() => {
    dispatch(clearFranchiseLedger());
  }, [dispatch]);

  return {
    ...state,
    fetchFinancialSummary,
    handleProcessSettlement,
    handleReviewWithdrawal,
    fetchFranchiseLedger,
    resetMessages,
    resetFranchiseLedger,
  };
};

export default useFranchiseFinancials;