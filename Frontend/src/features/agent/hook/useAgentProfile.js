import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAgentData } from "../service/agent.api"; 
import { 
  setLoading, 
  setDashboardData, 
  setError 
} from "../state/agent.slice";

export const useFetchProfile = () => {
  const dispatch = useDispatch();

  
  const { 
    profile, 
    wallet, 
    binaryStats, 
    treeNodes, 
    recentDownlines, 
    loading, 
    error 
  } = useSelector((state) => state.agent); 



const fetchDashboard = useCallback(async () => {
  try {
    dispatch(setLoading(true));
    const response = await getAgentData();

    console.log("=== API RAW RESPONSE ===", response);

   
    const baseData = response.data || response;
    
   
    const payload = baseData.dashboard || baseData;
    
    console.log("=== PARSED PAYLOAD FOR REDUX ===", payload);
    dispatch(setDashboardData(payload));

  } catch (err) {
    console.error("=== API ERROR ===", err);
    const errorMessage = err.response?.data?.message || err.message || "Failed to fetch dashboard data";
    dispatch(setError(errorMessage));
  }
}, [dispatch]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    profile,
    wallet,
    binaryStats,
    treeNodes,
    recentDownlines,
    loading,
    error,
    refetchDashboard: fetchDashboard,
  };
};