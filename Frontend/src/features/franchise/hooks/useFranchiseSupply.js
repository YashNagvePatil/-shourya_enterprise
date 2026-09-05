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
} from "../state/franchiseSuplies.slice";

import {
  createSupplyRequest as createSupplyRequestApi,
  getSupplyRequestsForHierarchy as getSupplyRequestsApi,
  confirmSupplyReceived as confirmReceivedApi,
  fulfillSubordinateSupply as fulfillSubordinateApi,
} from "../service/franchise.api";

export const useFranchiseSupply = () => {
  const dispatch = useDispatch();

  // Redux States
  const requests = useSelector(selectAllSupplyRequests);
  const selectedRequest = useSelector(selectSelectedSupplyRequest);
  const filters = useSelector(selectSupplyFilters);

  // Local UI Status
  const [loading, setLoading] = useState(false);
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
   */
  const createNewSupplyRequest = useCallback(
    async (requestData) => {
      setCreatingLoading(true);
      setError(null);
      try {
        const response = await createSupplyRequestApi(requestData);
        
        if (response.success && response.supplyRequest) {
          dispatch(addSupplyRequest(response.supplyRequest));
          setSuccessMessage("Supply request created successfully!");
        } else {
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
   * Franchise marks a dispatched supply as Received
   */
  const confirmReceived = useCallback(
    async (requestId) => {
      setActionLoading(true);
      setError(null);
      try {
        const response = await confirmReceivedApi(requestId);
        if (response.success && response.supplyRequest) {
          dispatch(updateStatusAction({ 
            requestId, 
            status: "Received",
            receivedAt: response.supplyRequest.receivedAt 
          }));
          setSuccessMessage("Supply marked as received successfully!");
        }
        return response;
      } catch (err) {
        const errMsg = err.message || "Failed to confirm supply receipt";
        setError(errMsg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [dispatch]
  );

  /**
   * Higher-tier franchise fulfills a subordinate supply request
   */
  const fulfillRequest = useCallback(
    async (requestId, data = {}) => {
      setActionLoading(true);
      setError(null);
      try {
        const response = await fulfillSubordinateApi(requestId, data);
        if (response.success && response.supplyRequest) {
          dispatch(updateStatusAction({ requestId, status: "Dispatched" }));
          setSuccessMessage("Supply request dispatched successfully!");
          // Refetch to get updated list
          await fetchSupplyRequests();
        }
        return response;
      } catch (err) {
        const errMsg = err.message || "Failed to fulfill supply request";
        setError(errMsg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [dispatch, fetchSupplyRequests]
  );

  /**
   * Updates the status of a specific supply request (local only)
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
    setSuccessMessage(null);
  }, [dispatch]);

  /**
   * Computes client-side filtered "My Requests" - only own requests
   */
  const myRequests = useMemo(() => {
    return requests.filter((req) => {
      // Own requests = requesterFranchise is current user
      const matchesStatus =
        filters.status === "ALL" ||
        req.status?.toLowerCase() === filters.status.toLowerCase();
      const matchesSearch =
        !filters.search ||
        req.requestNumber?.toLowerCase().includes(filters.search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [requests, filters]);

  /**
   * All requests visible to this franchise (including subordinate requests)
   */
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        !filters.search ||
        req.requestNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
        req.requesterLocation?.district?.toLowerCase().includes(filters.search.toLowerCase()) ||
        req.requesterLocation?.state?.toLowerCase().includes(filters.search.toLowerCase());

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
    myRequests,
    selectedRequest,
    filters,

    // UI Status
    loading,
    creatingLoading,
    actionLoading,
    error,
    successMessage,

    // Methods & Actions
    fetchSupplyRequests,
    createNewSupplyRequest,
    confirmReceived,
    fulfillRequest,
    updateStatus,
    setSelectedRequest,
    setFilters,
    resetSupplyState,
  };
};

export default useFranchiseSupply;