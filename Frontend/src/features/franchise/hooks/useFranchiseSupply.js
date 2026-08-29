import { useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSupplyRequests,
  addSupplyRequest,
  updateSupplyRequestStatus as updateStatusAction,
  setSelectedSupplyRequest as setSelectedAction,
  setSupplyFilters as setFiltersAction,
  clearSupplyState,
  selectAllSupplyRequests,
  selectSelectedSupplyRequest,
  selectSupplyFilters,
} from "../state/franchiseSuplies.slice"; // Adjust path as needed

import {
  createSupplyRequest as createSupplyRequestApi,
  getSupplyRequestsForHierarchy as getSupplyRequestsApi,
} from "../service/franchise.api"; // Adjust path as needed

export const useFranchiseSupply = () => {
  const dispatch = useDispatch();

  // Redux States
  const requests = useSelector(selectAllSupplyRequests);
  const selectedRequest = useSelector(selectSelectedSupplyRequest);
  const filters = useSelector(selectSupplyFilters);

  // Local UI Status
  const [loading, setLoading] = useState(false);
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetches supply requests based on the franchise hierarchy level
   */
  const fetchSupplyRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSupplyRequestsApi();
      const supplyData = Array.isArray(response)
        ? response
        : response.requests || [];

      dispatch(setSupplyRequests(supplyData));
      return supplyData;
    } catch (err) {
      const errMsg = err.message || "Failed to fetch supply requests";
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  /**
   * Submits a new supply request and updates Redux state
   * @param {Object} requestData - { items: [ { productId, quantity } ] }
   */
  const createNewSupplyRequest = useCallback(
    async (requestData) => {
      setCreatingLoading(true);
      setError(null);
      try {
        const response = await createSupplyRequestApi(requestData);
        
        if (response.success && response.supplyRequest) {
          dispatch(addSupplyRequest(response.supplyRequest));
        } else {
          // Re-fetch to ensure sync if response structure varies
          await fetchSupplyRequests();
        }
        return response;
      } catch (err) {
        const errMsg = err.message || "Failed to create supply request";
        setError(errMsg);
        throw err;
      } finally {
        setCreatingLoading(false);
      }
    },
    [dispatch, fetchSupplyRequests]
  );

  /**
   * Updates the status of a specific supply request
   * @param {string} requestId 
   * @param {string} status 
   */
  const updateStatus = useCallback(
    (requestId, status) => {
      dispatch(updateStatusAction({ requestId, status }));
    },
    [dispatch]
  );

  /**
   * Sets the actively selected request for detail views/modals
   */
  const setSelectedRequest = useCallback(
    (request) => {
      dispatch(setSelectedAction(request));
    },
    [dispatch]
  );

  /**
   * Updates supply filters (status, search string)
   */
  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setFiltersAction(newFilters));
    },
    [dispatch]
  );

  /**
   * Resets supply state back to initial values
   */
  const resetSupplyState = useCallback(() => {
    dispatch(clearSupplyState());
    setError(null);
  }, [dispatch]);

  /**
   * Computes client-side filtered requests based on filter slice state
   */
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // 1. Search Filter (Matches Request Number or Location)
      const matchesSearch =
        !filters.search ||
        req.requestNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
        req.requesterLocation?.district?.toLowerCase().includes(filters.search.toLowerCase()) ||
        req.requesterLocation?.state?.toLowerCase().includes(filters.search.toLowerCase());

      // 2. Status Filter ('ALL' or specific status)
      const matchesStatus =
        filters.status === "ALL" ||
        req.status?.toUpperCase() === filters.status.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [requests, filters]);

  return {
    // Redux State
    requests,
    filteredRequests,
    selectedRequest,
    filters,

    // UI Status
    loading,
    creatingLoading,
    error,

    // Methods & Actions
    fetchSupplyRequests,
    createNewSupplyRequest,
    updateStatus,
    setSelectedRequest,
    setFilters,
    resetSupplyState,
  };
};

export default useFranchiseSupply;