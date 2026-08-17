import { useCallback,useRef,useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAgentsdata,getAgentList,getAgentDetails,changeAgentStatus } from "../service/admin.api.js"; 
// Redux Slice Actions
import {
  fetchDashboardStart,
  fetchDashboardSuccess,
  fetchDashboardFailure,
  clearAdminError,
  resetAdminState,
  
  setAgentPage,
  fetchAgentsListSuccess,
  fetchAgentsListFailure,
  fetchAgentsListStart,
  setAgentFilters,
  fetchAgentDetailsStart,
  fetchAgentDetailsSuccess,
  fetchAgentDetailsFailure,
  toggleAgentStatusStart,
  toggleAgentStatusSuccess,
  toggleAgentStatusFailure,
  clearSelectedAgent,

} from "../state/admin.slice.js";

export const useAdmin = () => {
  const dispatch = useDispatch();

  // Redux State Access
  const {
    summary,
    recentAgents,
    monthlyTrend,
    isLoading,
    error,
    isSuccess,
  } = useSelector((state) => state.admin);

  // Function: API call karke Redux state update karega
  const fetchDashboardData = useCallback(async () => {
    dispatch(fetchDashboardStart());
    try {
      const responseData = await getAgentsdata();
      dispatch(fetchDashboardSuccess(responseData));
      return responseData;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch dashboard data";
      dispatch(fetchDashboardFailure(errorMessage));
    }
  }, [dispatch]);

  // Helper Functions
  const clearError = useCallback(() => {
    dispatch(clearAdminError());
  }, [dispatch]);

  const resetState = useCallback(() => {
    dispatch(resetAdminState());
  }, [dispatch]);

  return {
    // State Values
    summary,
    recentAgents,
    monthlyTrend,
    isLoading,
    error,
    isSuccess,

    // Operations / Actions
    fetchDashboardData,
    clearError,
    resetState,
  };
};

export const useAgentList = () => {
  const dispatch = useDispatch();
  
  // State layer se data extract karna
  const { agentsList, pagination, filters, isLoading, error, isSuccess } =
    useSelector((state) => state.admin);

  const searchDebounceRef = useRef(null);

  // 1. Direct API + Redux State Manager Function
  const fetchAgents = useCallback(
    async (overrideParams = {}) => {
      dispatch(fetchAgentsListStart());
      try {
        const cacheBuster = `?t=${new Date().getTime()}`
        const queryParams = {
          page: overrideParams.page || pagination.currentPage,
          limit: overrideParams.limit || pagination.limit,
          search: overrideParams.search !== undefined ? overrideParams.search : filters.search,
          status: overrideParams.status !== undefined ? overrideParams.status : filters.status,
        };

        // Direct API Layer Call
        const responseData = await getAgentList(queryParams);
        
        // Success Action Dispatch
        dispatch(fetchAgentsListSuccess(responseData));
      } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch agents";
        dispatch(fetchAgentsListFailure(message));
      }
    },
    [dispatch, pagination.currentPage, pagination.limit, filters.search, filters.status]
  );

  // Page ya status filter change hone par API fire karein
  useEffect(() => {
    fetchAgents();
  }, [pagination.currentPage, filters.status]);

  // Search input par 500ms Debounce Handler
  const handleSearchChange = (searchValue) => {
    dispatch(setAgentFilters({ search: searchValue }));

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(() => {
      dispatch(setAgentPage(1));
      fetchAgents({ search: searchValue, page: 1 });
    }, 500);
  };

  // Status Filter Handler
  const handleStatusChange = (statusValue) => {
    dispatch(setAgentFilters({ status: statusValue }));
    dispatch(setAgentPage(1));
  };

  // Pagination Handler
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      dispatch(setAgentPage(newPage));
    }
  };

  return {
    // States
    agentsList,
    pagination,
    filters,
    isLoading,
    error,
    isSuccess,

    // Methods
    handleSearchChange,
    handleStatusChange,
    handlePageChange,
    refreshList: fetchAgents,
  };
};


export const useAgentDetail = () => {
  const dispatch = useDispatch();
  const { selectedAgent, isDetailLoading, isActionLoading, error } = useSelector(
    (state) => state.admin
  );

  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  // 1. Fetch Agent Profile (Wrapped cleanly)
  const loadAgentProfile = useCallback(
    async (agentId) => {
      if (!agentId) return;
      
      dispatch(fetchAgentDetailsStart());
      try {
        const responseData = await getAgentDetails(agentId);
        // Ensure standard payload structure
        const agentData = responseData?.data || responseData;
        dispatch(fetchAgentDetailsSuccess(agentData));
      } catch (err) {
        const msg = err.response?.data?.message || err.message || "Failed to fetch details";
        dispatch(fetchAgentDetailsFailure(msg));
      }
    },
    [dispatch]
  );

  // 2. Toggle Status (Block / Unblock)
  const toggleStatus = async () => {
    if (!selectedAgent?._id) return;
    const nextStatus = selectedAgent.status === "Blocked" ? "Active" : "Blocked";

    dispatch(toggleAgentStatusStart());
    try {
      const responseData = await changeAgentStatus(selectedAgent._id, nextStatus, blockReason);
      const updatedData = responseData?.data || responseData;
      dispatch(toggleAgentStatusSuccess(updatedData));
      setBlockModalOpen(false);
      setBlockReason("");
    } catch (err) {
      const msg = err.response?.data?.message || "Action failed";
      dispatch(toggleAgentStatusFailure(msg));
    }
  };

  return {
    selectedAgent,
    isDetailLoading,
    isActionLoading,
    error,
    blockModalOpen,
    blockReason,
    setBlockReason,
    setBlockModalOpen,
    loadAgentProfile,
    toggleStatus,
    clearProfile: () => dispatch(clearSelectedAgent()),
  };
};


