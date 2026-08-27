import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDashboardOverview, getNetworkAnalytics } from "../service/franchiseManage.api.js";
import {
  setOverviewLoading,
  setAnalyticsLoading,
  setError,
  clearError,
  setDashboardOverview,
  setNetworkAnalytics,
  resetDashboardState,
} from "../state/manageFranchiseDashboard.slice.js";

export const useAdminDashboard = () => {
  const dispatch = useDispatch();
  
  // Extract state from the dedicated adminDashboard slice
  const { metrics, analytics, loading, error } = useSelector(
    (state) => state.adminDashboardForFranchise
  );

  // 1. Fetch Overview Metrics (GMV, Franchise counts, Tier breakdown)
  const fetchOverview = useCallback(async () => {
    try {
      dispatch(clearError());
      dispatch(setOverviewLoading(true));
      const response = await getDashboardOverview();
      dispatch(setDashboardOverview(response.metrics));
      return response.metrics;
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch dashboard overview";
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setOverviewLoading(false));
    }
  }, [dispatch]);

  // 2. Fetch Network Analytics (Monthly revenue & order performance trends)
  const fetchAnalytics = useCallback(async () => {
    try {
      dispatch(clearError());
      dispatch(setAnalyticsLoading(true));
      const response = await getNetworkAnalytics();
      dispatch(setNetworkAnalytics(response.analytics));
      return response.analytics;
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch network analytics";
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setAnalyticsLoading(false));
    }
  }, [dispatch]);

  // 3. Helper to fetch both Dashboard API endpoints in parallel
  const fetchAllDashboardData = useCallback(async () => {
    return await Promise.all([fetchOverview(), fetchAnalytics()]);
  }, [fetchOverview, fetchAnalytics]);

  // 4. Reset state on unmount or logout
  const resetDashboard = useCallback(() => {
    dispatch(resetDashboardState());
  }, [dispatch]);

  return {
    // State Accessors
    metrics,
    analytics,
    loading,
    error,

    // API Trigger Logics
    fetchOverview,
    fetchAnalytics,
    fetchAllDashboardData,
    resetDashboard,
  };
};

export default useAdminDashboard;