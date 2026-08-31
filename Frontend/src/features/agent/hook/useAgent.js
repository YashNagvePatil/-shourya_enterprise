import { useEffect, useCallback,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAgentData} from "../service/agent.api.js"; 
import { setLoading, setDashboardData, setError ,setWalletDetails,updateWalletBalances,setNetworkTree} from "../state/agent.slice.js"; 
import {getAgentWalletData,getAgentNetworkData} from "../service/agent.api.js"




  export const useFetchDashboard = () => {
  const dispatch = useDispatch();

  // 1. data reading from Redux State Layer 
  const { profile, wallet, binaryStats, treeNodes,recentDownlines,loading, error } =
    useSelector((state) => state.agent);

  // 2. Fetch Logic (API + State Management)
  const fetchDashboard = useCallback(async () => {
    dispatch(setLoading(true)); // State: Set loading true
    try {
      const cacheBuster = `?t=${new Date().getTime()}`;
      const data = await getAgentData(cacheBuster); // API: Fetch from backend
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

export const useAgentWallet = () => {
  const dispatch = useDispatch();
  const { wallet, loading, error } = useSelector((state) => state.agent);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // 1. Fetch Wallet Data using your service layer
  const fetchWalletDetails = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      // Direct calling your service function
      const cacheBuster = `?t=${new Date().getTime()}`; 
      const data = await getAgentWalletData(cacheBuster); 
      if (data.success) {
        dispatch(setWalletDetails(data));
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to load wallet metrics";
      dispatch(setError(errMsg));
    }
  }, [dispatch]);

  // 2. Withdrawal action 
  const executeWithdrawal = useCallback(async (amount) => {
    setIsWithdrawing(true);
    try {
      // Jab aap settlement request ki API service banaenge tab yahan replace kar dena
      // const response = await postWithdrawRequest({ amount });
      
      // Temporary setup response parsing for your custom flow
      dispatch(updateWalletBalances({ 
        updatedBalances: { 
          availableBalance: wallet.balances.availableBalance - amount,
          pendingPayout: wallet.balances.pendingPayout + Number(amount)
        } 
      }));
      return { success: true, message: "Payout requested successfully" };
    } catch (err) {
      return { success: false, message: "Withdrawal execution failed" };
    } finally {
      setIsWithdrawing(false);
    }
  }, [dispatch, wallet]);

  return {
    wallet,
    isLoading: loading,
    error,
    isWithdrawing,
    fetchWalletDetails,
    executeWithdrawal
  };
};





export const useAgentNetwork = () => {
  const dispatch = useDispatch();
  
  // Extracting from centralized agent reducer state
  const { binaryStats, treeNodes, profile, loading, error } = useSelector(
    (state) => state.agent
  );

  // Fetch Tree Canvas using service layer
  const fetchNetworkTree = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      // Dynamic timestamp token to avoid aggressive browser cache loops when needed
      const cacheBuster = `?t=${Date.now()}`;
      const response = await getAgentNetworkData(cacheBuster); 

      if (response?.success) {
        // Updated: Pass response.data (or full response as expected by your slice)
        dispatch(setNetworkTree(response.data || response));
      } else {
        dispatch(setError(response?.message || "Failed to load network tree"));
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to map genealogy nodes";
      dispatch(setError(errMsg));
    } finally {
      // UX Safety: Always reset loading state regardless of success/failure
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return {
    binaryStats,  
    treeNodes,    
    agentProfile: profile,
    isLoading: loading,
    error,
    fetchNetworkTree
  };
};


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