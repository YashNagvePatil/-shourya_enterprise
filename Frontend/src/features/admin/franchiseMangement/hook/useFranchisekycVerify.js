import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setError,
  setSuccessMessage,
  clearMessages,
  setPendingApplications,
  setSelectedApplication,
  clearSelectedApplication,
  removePendingApplication,
  setHierarchy,
  updateHierarchyStatus,
} from "../state/franchiseVerifyKyc.slice"; // Adjust path to slice
import {
  getPendingApplications,
  reviewApplication,
  getFranchiseHierarchy,
  updateFranchiseStatus,
} from "../service/franchiseManage.api"; // Adjust path to API functions

const useFranchiseManage = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.franchiseManageKyc);

  const fetchPending = useCallback(
    async (params = {}) => {
      dispatch(clearMessages());
      dispatch(setLoading({ key: "pending", value: true }));
      try {
        const response = await getPendingApplications(params);
        if (response.success) {
          dispatch(
            setPendingApplications({
              applications: response.applications,
              total: response.total,
              page: response.page,
            })
          );
        }
        return response;
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          error.response?.message ||
          "Failed to fetch pending applications";
        dispatch(setError(msg));
        throw error;
      } finally {
        dispatch(setLoading({ key: "pending", value: false }));
      }
    },
    [dispatch]
  );

  const handleReviewApplication = useCallback(
    async (franchiseId, action, rejectionReason = "") => {
      dispatch(clearMessages());
      dispatch(setLoading({ key: "review", value: true }));
      try {
        const response = await reviewApplication(franchiseId, {
          action,
          rejectionReason,
        });
        if (response.success) {
          dispatch(removePendingApplication(franchiseId));
          dispatch(setSuccessMessage(response.message));
        }
        return response;
      } catch (error) {
        // FIXED: Safe optional chaining to prevent uncaught runtime errors
        const msg =
          error.response?.data?.message ||
          error.response?.message ||
          "Failed to review application";
        dispatch(setError(msg));
        throw error;
      } finally {
        dispatch(setLoading({ key: "review", value: false }));
      }
    },
    [dispatch]
  );

  const fetchHierarchy = useCallback(async () => {
    dispatch(clearMessages());
    dispatch(setLoading({ key: "hierarchy", value: true }));
    try {
      const response = await getFranchiseHierarchy();
      if (response.success) {
        dispatch(
          setHierarchy({
            hierarchy: response.hierarchy,
            count: response.count,
          })
        );
      }
      // FIXED: Standardized return statement
      return response;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.message ||
        "Failed to fetch hierarchy";
      dispatch(setError(msg));
      throw error;
    } finally {
      dispatch(setLoading({ key: "hierarchy", value: false }));
    }
  }, [dispatch]);

  const handleUpdateStatus = useCallback(
    async (franchiseId, status) => {
      dispatch(clearMessages());
      dispatch(setLoading({ key: "statusUpdate", value: true }));
      try {
        const response = await updateFranchiseStatus(franchiseId, { status });
        if (response.success) {
          dispatch(updateHierarchyStatus({ franchiseId, status }));
          dispatch(setSuccessMessage(response.message));
        }
        return response;
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          error.response?.message ||
          "Failed to update franchise status";
        dispatch(setError(msg));
        throw error;
      } finally {
        dispatch(setLoading({ key: "statusUpdate", value: false }));
      }
    },
    [dispatch]
  );

  // Optional actions for setting/clearing single application preview state
  const selectApp = useCallback(
    (app) => {
      dispatch(setSelectedApplication(app));
    },
    [dispatch]
  );

  const clearApp = useCallback(() => {
    dispatch(clearSelectedApplication());
  }, [dispatch]);

  const resetMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  return {
    ...state,
    fetchPending,
    handleReviewApplication,
    fetchHierarchy,
    handleUpdateStatus,
    selectApp,
    clearApp,
    resetMessages,
  };
};

export default useFranchiseManage;