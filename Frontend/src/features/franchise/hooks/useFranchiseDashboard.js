import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setFinancialOverview,
  setDashboardMetrics,
  setDateFilter as setReduxDateFilter,
  resetDashboardState,
  selectFinancials,
  selectDashboardMetrics,
  selectDashboardDateFilter,
} from "../state/franchiseDashboard.slice"; // Adjust path
import {
  getFinancialOverview,
  getSupplyRequestsForHierarchy,
  getInventory,
} from "../service/franchise.api"; // Adjust path

export const useFranchiseDashboard = () => {
  const dispatch = useDispatch();

  // Redux States
  const financials = useSelector(selectFinancials);
  const metrics = useSelector(selectDashboardMetrics);
  const dateFilter = useSelector(selectDashboardDateFilter);

  // Local UI States for async status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const errMsg = err.response?.data?.message || err.message || "Failed to fetch financial overview";
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
      const errMsg = err.response?.data?.message || err.message || "Failed to load dashboard metrics";
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
      // Promise.allSettled guarantees all APIs run even if one fails
      await Promise.allSettled([fetchFinancials(), fetchMetrics()]);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [fetchFinancials, fetchMetrics]);

  /**
   * Updates the date filter setting in Redux ('daily' | 'weekly' | 'monthly' | 'yearly')
   */
  const setFilter = useCallback(
    (filter) => {
      dispatch(setReduxDateFilter(filter));
    },
    [dispatch]
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
    dateFilter,

    // Local UI Status
    loading,
    error,

    // Actions & Methods
    fetchFinancials,
    fetchMetrics,
    loadDashboardData,
    setDateFilter: setFilter,
    clearDashboard,
  };
};

export default useFranchiseDashboard;