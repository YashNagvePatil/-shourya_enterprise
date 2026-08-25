import { useCallback,useRef,useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAgentsdata,getAgentList,getAgentDetails,changeAgentStatus } from "../service/admin.api.js";
import { createProductThunk, resetProductState } from "../state/product.slice.js";
import { useSearchParams } from "react-router"; 
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
  const [searchParams] = useSearchParams();
  
  const { selectedAgent, isDetailLoading, isActionLoading, error } = useSelector(
    (state) => state.admin
  );

  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  // URL Query parameter: ?id=6a7ee02f2ef7acdbbf7c9bbe
  const agentId = searchParams.get("id");

   useEffect(() => {
  console.log(">>> AgentDetailPage Mounted! agentId in URL:", agentId);

  if (agentId) {
    console.log(">>> Calling API with ID:", agentId);
    loadAgentProfile(agentId);
  } else {
    console.error(">>> ERROR: agentId is NULL or UNDEFINED in URL!");
  }
}, [agentId]);


  // 1. Fetch Agent Profile
  const loadAgentProfile = useCallback(
    async (targetId = agentId) => {
      if (!targetId) {
        dispatch(fetchAgentDetailsFailure("Agent ID is missing in URL"));
        return;
      }

      dispatch(fetchAgentDetailsStart());
      try {
        const responseData = await getAgentDetails(targetId);
        // Standard API response formats handle kar rahe hain (data wrapper safety)
        const agentData = responseData?.data?.data || responseData?.data || responseData;
        dispatch(fetchAgentDetailsSuccess(agentData));
      } catch (err) {
        const msg = err.response?.data?.message || err.message || "Failed to fetch details";
        dispatch(fetchAgentDetailsFailure(msg));
      }
    },
    [dispatch, agentId]
  );

  // 2. Toggle Status (Block / Unblock)
// 2. Toggle Status (Block / Unblock)
    const toggleStatus = async (forcedStatus = null) => {
 
  const targetId = selectedAgent?._id || selectedAgent?.id || agentId;

  console.log(">>> Attempting toggleStatus for Target ID:", targetId);

  if (!targetId) {
    console.error(">>> ERROR: Target Agent ID is missing in toggleStatus!");
    dispatch(toggleAgentStatusFailure("Agent ID missing for status update"));
    return;
  }

  let nextStatus = forcedStatus;
  if (!nextStatus) {
    nextStatus = selectedAgent?.status === "Blocked" ? "Active" : "Blocked";
  }

  const finalReason = nextStatus === "Active" ? "" : blockReason;

  dispatch(toggleAgentStatusStart());
  try {
    const responseData = await changeAgentStatus(
      targetId, // 👈 Fix: Passing verified targetId instead of direct selectedAgent._id
      nextStatus,
      finalReason
    );

    const updatedData = responseData?.data?.data || responseData?.data || responseData;

    dispatch(toggleAgentStatusSuccess(updatedData));
    setBlockModalOpen(false);
    setBlockReason("");
  } catch (err) {
    console.error(">>> Status Update API Error:", err);
    const msg = err.response?.data?.message || err.message || "Action failed";
    dispatch(toggleAgentStatusFailure(msg));
  }
};

  // 3. Clear Profile Cleanup Wrapper
  const clearProfile = useCallback(() => {
    dispatch(clearSelectedAgent());
  }, [dispatch]);

  return {
    agentId,
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
    clearProfile,
  };
};


// create product 

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const useCreateProduct = () => {
  const dispatch = useDispatch();

  const { isLoading, isSuccess, isError, error, message } = useSelector(
    (state) => state.createProduct
  );

  /**
   * Submit Product Handler
   * @param {Object} productData - { name: 'Product A', price: 100, images: [File1, File2] }
   */
  const handleCreateProduct = async (productData) => {
    try {
      let base64Images = [];

      // 1. Convert File objects in images array to Base64 strings
      if (
        productData.images &&
        Array.isArray(productData.images) &&
        productData.images.length > 0
      ) {
        base64Images = await Promise.all(
          productData.images.map((file) =>
            file instanceof File ? fileToBase64(file) : file
          )
        );
      }

      // 2. Assemble Pure JSON Payload
      const payload = {
        ...productData,
        images: base64Images,
      };

      // 3. Dispatch JSON Object to Redux Thunk and unwrap response
      const response = await dispatch(createProductThunk(payload)).unwrap();
      return response;
    } catch (err) {
      console.error("Error creating product:", err);
      throw err;
    }
  };

  const clearState = () => {
    dispatch(resetProductState());
  };

  return {
    handleCreateProduct,
    clearState,
    isLoading,
    isSuccess,
    isError,
    error,
    message,
  };
};


