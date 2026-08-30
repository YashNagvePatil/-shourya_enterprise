import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFranchiseFinancialOverview,
  getFranchisePassbook,
  getFranchiseAnalytics,
  requestWithdrawal,
  cancelWithdrawal,
} from "../service/franchise.api"; // Aapki API file ka path

import {
  setFinancialOverview,
  setPassbookData,
  setAnalyticsData,
  setAnalyticsFilter,
} from "../state/franchiseFinance.slice"; // Aapki slice ka path

export const useFranchiseFinance = () => {
  const dispatch = useDispatch();

  // Redux Store State
  const { financials, passbook, analytics, analyticsFilter } = useSelector(
    (state) => state.franchiseFinance
  );

  // Local Component Loading & Error States
  const [loading, setLoading] = useState(false);
  const [passbookLoading, setPassbookLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Helper to clear alerts
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // 1. Fetch Financial Overview
  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getFranchiseFinancialOverview();
      if (response.data?.success) {
        dispatch(setFinancialOverview(response.data.financials));
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load financial overview."
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // 2. Fetch Passbook Transactions
  const fetchPassbook = useCallback(
    async (params = {}) => {
      setPassbookLoading(true);
      setError(null);
      try {
        const response = await getFranchisePassbook(params);
        if (response.data?.success) {
          dispatch(setPassbookData(response.data.data));
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load transaction passbook."
        );
      } finally {
        setPassbookLoading(false);
      }
    },
    [dispatch]
  );

  // 3. Fetch Analytics Data
  const fetchAnalyticsData = useCallback(
    async (filter) => {
      const activeFilter = filter || analyticsFilter;
      try {
        const response = await getFranchiseAnalytics(activeFilter);
        if (response.data?.success) {
          dispatch(
            setAnalyticsData({
              analytics: response.data.analytics,
              filter: activeFilter,
            })
          );
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load analytics data."
        );
      }
    },
    [dispatch, analyticsFilter]
  );

  // 4. Submit Withdrawal Request
  const handleRequestWithdrawal = async (amount, notes) => {
    setActionLoading(true);
    clearMessages();
    try {
      const response = await requestWithdrawal(amount, notes);
      if (response.data?.success) {
        setSuccessMessage(response.data.message);
        // Refresh overview to sync new balance & pending request in Redux
        await fetchOverview();
        return true;
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit withdrawal request."
      );
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Cancel Pending Withdrawal Request
  const handleCancelWithdrawal = async (withdrawalId) => {
    setActionLoading(true);
    clearMessages();
    try {
      const response = await cancelWithdrawal(withdrawalId);
      if (response.data?.success) {
        setSuccessMessage(response.data.message);
        // Refresh overview to sync refunded balance in Redux
        await fetchOverview();
        return true;
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to cancel withdrawal request."
      );
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Change Analytics Filter Tag
  const changeFilter = (filter) => {
    dispatch(setAnalyticsFilter(filter));
    fetchAnalyticsData(filter);
  };

  return {
    // Redux State Values
    financials,
    wallet: financials.wallet,
    bankDetailsConfigured: financials.bankDetailsConfigured,
    activePendingWithdrawal: financials.activePendingWithdrawal,
    passbookTransactions: passbook.transactions,
    passbookPagination: passbook.pagination,
    analytics,
    analyticsFilter,

    // UI Feedback States
    loading,
    passbookLoading,
    actionLoading,
    error,
    successMessage,

    // Operations / Actions
    fetchOverview,
    fetchPassbook,
    fetchAnalyticsData,
    handleRequestWithdrawal,
    handleCancelWithdrawal,
    changeFilter,
    clearMessages,
  };
};