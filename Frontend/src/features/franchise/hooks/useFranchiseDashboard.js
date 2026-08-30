import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setFinancialOverview,
  setDashboardMetrics,
  setAnalyticsData, //  New Action
  setDateFilter as setReduxDateFilter,
  resetDashboardState,
  selectFinancials,
  selectDashboardMetrics,
  selectAnalyticsData, //  New Selector
  selectDashboardDateFilter,
} from "../state/franchiseDashboard.slice"; // Adjust path

import {
  getFinancialOverview,
  getSupplyRequestsForHierarchy,
  getInventory,
  getDashboardAnalytics, //  New API Endpoint
} from "../service/franchise.api"; // Adjust path

export const useFranchiseDashboard = () => {
  const dispatch = useDispatch();

  // Redux States
  const financials = useSelector(selectFinancials);
  const metrics = useSelector(selectDashboardMetrics);
  const analytics = useSelector(selectAnalyticsData); //  Access dynamic analytics state
  const dateFilter = useSelector(selectDashboardDateFilter);

  // Local UI States for async status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 📊 NEW: Fetches dynamic monthly/weekly chart analytics data
   */
  const fetchAnalytics = useCallback(
    async (filter = dateFilter) => {
      try {
        const res = await getDashboardAnalytics(filter);

        // Safe extraction for Axios interceptor or plain response
        const data = res?.data || res;

        if (data?.success && Array.isArray(data?.analytics)) {
          dispatch(setAnalyticsData(data.analytics));
        }
        return data;
      } catch (err) {
        const errMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch analytics data";
        setError(errMsg);
        throw err;
      }
    },
    [dispatch, dateFilter]
  );

  /**
   * Fetches financial overview data and syncs with Redux slice
   */
  const fetchFinancials = useCallback(async () => {
    try {
      const res = await getFinancialOverview();

      // Handle response safely (Axios wrapper fallback)
      const data = res?.data || res;

      if (data?.success && data?.financials) {
        const { wallet, activePendingWithdrawal } = data.financials;

        // Correct Mapping with upgraded backend structure
        dispatch(
          setFinancialOverview({
            walletBalance: wallet?.balance || 0,
            totalEarnings: wallet?.totalEarned || 0,
            pendingRent: wallet?.pendingRent || 0,
            pendingRoi: wallet?.pendingRoi || 0,
            totalWithdrawn: wallet?.totalWithdrawn || 0,
            activePendingWithdrawal: activePendingWithdrawal || null,
          })
        );
      }
      return data;
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch financial overview";
      setError(errMsg);
      throw err;
    }
  }, [dispatch]);

  /**
   * Aggregates dashboard metrics (inventory alerts, supply requests) into Redux slice
   */
  const fetchMetrics = useCallback(async () => {
    try {
      const [requestsRes, inventoryRes] = await Promise.all([
        getSupplyRequestsForHierarchy().catch(() => ({ requests: [] })),
        getInventory().catch(() => ({ inventory: [] })),
      ]);

      const requestsData = requestsRes?.data || requestsRes;
      const inventoryData = inventoryRes?.data || inventoryRes;

      const activeRequests = requestsData?.requests?.length || 0;

      // Count items with stock less than threshold (e.g., stock <= 5)
      const lowStockCount =
        inventoryData?.inventory?.filter((item) => item.stock <= 5).length || 0;

      dispatch(
        setDashboardMetrics({
          activeSupplyRequests: activeRequests,
          lowStockAlerts: lowStockCount,
        })
      );
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to load dashboard metrics";
      setError(errMsg);
    }
  }, [dispatch]);

  /**
   * Loads all core dashboard data safely with proper Loading state management
   */
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Promise.allSettled guarantees financials, metrics, AND analytics run simultaneously
      await Promise.allSettled([
        fetchFinancials(),
        fetchMetrics(),
        fetchAnalytics(dateFilter),
      ]);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [fetchFinancials, fetchMetrics, fetchAnalytics, dateFilter]);

  /**
   * Updates the date filter setting in Redux & re-fetches chart analytics
   */
  const setFilter = useCallback(
    (filter) => {
      dispatch(setReduxDateFilter(filter));
      // Filter switch hote hi analytics chart refresh karein
      fetchAnalytics(filter);
    },
    [dispatch, fetchAnalytics]
  );

  /**
   * Resets the entire dashboard Redux state and clears errors
   */
  const clearDashboard = useCallback(() => {
    dispatch(resetDashboardState());
    setError(null);
  }, [dispatch]);

  return {
    // Redux State Values
    financials,
    metrics,
    analytics, //  Returned to UI component
    dateFilter,

    // Local UI Status
    loading,
    error,

    // Actions & Methods
    fetchFinancials,
    fetchMetrics,
    fetchAnalytics, //  Exposed for manual refresh if needed
    loadDashboardData,
    setDateFilter: setFilter,
    clearDashboard,
  };
};

export default useFranchiseDashboard;