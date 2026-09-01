import { useCallback, useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAgentsdata,
  getAgentList,
  getAgentDetails,
  changeAgentStatus,
} from "../service/admin.api.js";
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
  resetAgentFilters,
  fetchAgentDetailsStart,
  fetchAgentDetailsSuccess,
  fetchAgentDetailsFailure,
  toggleAgentStatusStart,
  toggleAgentStatusSuccess,
  toggleAgentStatusFailure,
  clearSelectedAgent,
} from "../state/admin.slice.js";

// ==========================================
// 1. DASHBOARD HOOK
// ==========================================
export const useAdmin = () => {
  const dispatch = useDispatch();

  const {
    summary,
    binaryOverview,
    actionAlerts,
    recentAgents,
    recentFranchises,
    monthlyTrend,
    isLoading,
    error,
    isSuccess,
  } = useSelector((state) => state.admin);

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

  const clearError = useCallback(() => {
    dispatch(clearAdminError());
  }, [dispatch]);

  const resetState = useCallback(() => {
    dispatch(resetAdminState());
  }, [dispatch]);

  return {
    summary,
    binaryOverview,
    actionAlerts,
    recentAgents,
    recentFranchises,
    monthlyTrend,
    isLoading,
    error,
    isSuccess,
    fetchDashboardData,
    clearError,
    resetState,
  };
};

// ==========================================
// 2. AGENT LIST HOOK (UPDATED WITH ADVANCED FILTERS)
// ==========================================
export const useAgentList = () => {
  const dispatch = useDispatch();

  const { agentsList, pagination, filters, isLoading, error, isSuccess } = useSelector(
    (state) => state.admin
  );

  const searchDebounceRef = useRef(null);

  // Core API Fetch Function
  const fetchAgents = useCallback(
    async (overrideParams = {}) => {
      dispatch(fetchAgentsListStart());
      try {
        const queryParams = {
          page: overrideParams.page || pagination.currentPage,
          limit: overrideParams.limit || pagination.limit,
          search: overrideParams.search !== undefined ? overrideParams.search : filters.search,
          status: overrideParams.status !== undefined ? overrideParams.status : filters.status,
          role: overrideParams.role !== undefined ? overrideParams.role : filters.role,
          rank: overrideParams.rank !== undefined ? overrideParams.rank : filters.rank,
          kycStatus: overrideParams.kycStatus !== undefined ? overrideParams.kycStatus : filters.kycStatus,
          startDate: overrideParams.startDate !== undefined ? overrideParams.startDate : filters.startDate,
          endDate: overrideParams.endDate !== undefined ? overrideParams.endDate : filters.endDate,
          sortBy: overrideParams.sortBy !== undefined ? overrideParams.sortBy : filters.sortBy,
          sortOrder: overrideParams.sortOrder !== undefined ? overrideParams.sortOrder : filters.sortOrder,
        };

        const responseData = await getAgentList(queryParams);
        dispatch(fetchAgentsListSuccess(responseData));
      } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch agents";
        dispatch(fetchAgentsListFailure(message));
      }
    },
    [
      dispatch,
      pagination.currentPage,
      pagination.limit,
      filters.search,
      filters.status,
      filters.role,
      filters.rank,
      filters.kycStatus,
      filters.startDate,
      filters.endDate,
      filters.sortBy,
      filters.sortOrder,
    ]
  );

  // Trigger fetch on Filter / Page change
  useEffect(() => {
    fetchAgents();
  }, [
    pagination.currentPage,
    filters.status,
    filters.role,
    filters.rank,
    filters.kycStatus,
    filters.startDate,
    filters.endDate,
    filters.sortBy,
    filters.sortOrder,
  ]);

  // Debounced Search Handler
  const handleSearchChange = (searchValue) => {
    dispatch(setAgentFilters({ search: searchValue }));

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(() => {
      dispatch(setAgentPage(1));
      fetchAgents({ search: searchValue, page: 1 });
    }, 500);
  };

  // Multi-Filter Handler
  const handleFilterChange = (filterObject) => {
    dispatch(setAgentFilters(filterObject));
    dispatch(setAgentPage(1));
  };

  // Reset Filters Handler
  const handleResetFilters = () => {
    dispatch(resetAgentFilters());
    dispatch(setAgentPage(1));
  };

  // Pagination Handler
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      dispatch(setAgentPage(newPage));
    }
  };

  return {
    agentsList,
    pagination,
    filters,
    isLoading,
    error,
    isSuccess,
    handleSearchChange,
    handleFilterChange,
    handleResetFilters,
    handlePageChange,
    refreshList: fetchAgents,
  };
};

// ==========================================
// 3. SINGLE AGENT DETAIL HOOK
// ==========================================
export const useAgentDetail = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const { selectedAgent, isDetailLoading, isActionLoading, error } = useSelector(
    (state) => state.admin
  );

  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  const agentId = searchParams.get("id");

  const loadAgentProfile = useCallback(
    async (targetId = agentId) => {
      if (!targetId) {
        dispatch(fetchAgentDetailsFailure("Agent ID is missing in URL"));
        return;
      }

      dispatch(fetchAgentDetailsStart());
      try {
        const responseData = await getAgentDetails(targetId);
        // Extract inner payload matching updated getAgentById controller
        const agentData = responseData?.data || responseData;
        dispatch(fetchAgentDetailsSuccess(agentData));
      } catch (err) {
        const msg = err.response?.data?.message || err.message || "Failed to fetch details";
        dispatch(fetchAgentDetailsFailure(msg));
      }
    },
    [dispatch, agentId]
  );

  useEffect(() => {
    if (agentId) {
      loadAgentProfile(agentId);
    }
  }, [agentId, loadAgentProfile]);

  // Toggle Status (Block / Unblock)
 const toggleStatus = async ({ status = null, kycStatus = null }) => {
  const targetId = selectedAgent?._id || agentId;

  if (!targetId) {
    dispatch(toggleAgentStatusFailure("Agent ID missing for status update"));
    return;
  }

  // 1. Dynamic Payload Building
  const payload = {};

  if (status) {
    payload.status = status;
    if (status === "Blocked") {
      payload.reason = blockReason || "No reason provided";
    } else if (status === "Active") {
      payload.reason = "";
    }
  }

  if (kycStatus) {
    payload.kycStatus = kycStatus;
  }

  // Check if payload has at least one field to update
  if (Object.keys(payload).length === 0) {
    console.warn("No status or kycStatus provided to update");
    return;
  }

  // 2. Dispatch Start Action
  dispatch(toggleAgentStatusStart());

  try {
    // 3. API Call with single payload object
    const responseData = await changeAgentStatus(targetId, payload);
    const updatedData = responseData?.data || responseData;

    // 4. Update Redux Store & Reset Local States
    dispatch(toggleAgentStatusSuccess(updatedData));
    setBlockModalOpen(false);
    setBlockReason("");
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Action failed";
    dispatch(toggleAgentStatusFailure(msg));
  }
};

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

// ==========================================
// 4. CREATE PRODUCT HOOK
// ==========================================
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

  const handleCreateProduct = async (productData) => {
    try {
      let base64Images = [];

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

      const payload = {
        ...productData,
        images: base64Images,
      };

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