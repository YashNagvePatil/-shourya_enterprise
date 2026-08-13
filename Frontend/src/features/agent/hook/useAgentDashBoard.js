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

export const useAgentWallet = () => {
  const dispatch = useDispatch();
  const { wallet, loading, error } = useSelector((state) => state.agent);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // 1. Fetch Wallet Data using your service layer
  const fetchWalletDetails = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      // Direct calling your service function
      const data = await getAgentWalletData(); 
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

  // Fetch Tree Canvas using your service layer
  const fetchNetworkTree = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      // FIX 304 CACHE: Adding a dynamic timestamp token to break browser cache loops
      const cacheBuster = `?t=${new Date().getTime()}`;
      const data = await getAgentNetworkData(cacheBuster); 
      
      if (data.success) {
        dispatch(setNetworkTree(data));
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to map genealogy nodes";
      dispatch(setError(errMsg));
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