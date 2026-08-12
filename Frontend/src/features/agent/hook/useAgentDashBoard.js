import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAgentData} from "../service/agent.api.js"; 
import { setLoading, setDashboardData, setError } from "../state/agent.slice.js"; 

export const useFetchDashboard = () => {
  const dispatch = useDispatch();

  // 1. data reading from Redux State Layer 
  const { profile, wallet, binaryStats, treeNodes,recentDownlines,loading, error } =
    useSelector((state) => state.agent);

  // 2. Fetch Logic (API + State Management)
  const fetchDashboard = useCallback(async () => {
    dispatch(setLoading(true)); // State: Set loading true
    try {
      const data = await getAgentData(); // API: Fetch from backend
      if (data.success) {
        dispatch(setDashboardData(data.dashboard)); // State: Store payload in Redux
      } else {
        dispatch(setError("Dashboard data fetch failed"));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to connect to server";
      dispatch(setError(errorMessage)); // State: Store error in Redux
    }
  }, [dispatch]);

  // 3. Auto-fetch on mount (agar profile pehle se loaded nahi hai)
  useEffect(() => {
    if (!profile) {
      fetchDashboard();
    }
  }, [profile, fetchDashboard]);

  // 4. Return Data and Actions for UI Component
  return {
    profile,
    wallet,
    binaryStats,
    treeNodes,
    recentDownlines,
    loading,
    error,
    refetchDashboard: fetchDashboard, // Refetch function UI 
  };
};