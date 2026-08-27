import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setError,
  setSuccessMessage,
  clearMessages,
  setPendingApplications,
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
        if (response.data?.success) {
          dispatch(
            setPendingApplications({
              applications: response.data.applications,
              total: response.data.total,
              page: response.data.page,
            })
          );
        }
        return response.data;
      } catch (error) {
        const msg =
          error.response?.data?.message || "Failed to fetch pending applications";
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
        if (response.data?.success) {
          dispatch(removePendingApplication(franchiseId));
          dispatch(setSuccessMessage(response.data.message));
        }
        return response.data;
      } catch (error) {
        const msg =
          error.response?.data?.message || "Failed to review application";
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
      if (response.data?.success) {
        dispatch(
          setHierarchy({
            hierarchy: response.data.hierarchy,
            count: response.data.count,
          })
        );
      }
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to fetch hierarchy";
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
        if (response.data?.success) {
          dispatch(updateHierarchyStatus({ franchiseId, status }));
          dispatch(setSuccessMessage(response.data.message));
        }
        return response.data;
      } catch (error) {
        const msg =
          error.response?.data?.message || "Failed to update franchise status";
        dispatch(setError(msg));
        throw error;
      } finally {
        dispatch(setLoading({ key: "statusUpdate", value: false }));
      }
    },
    [dispatch]
  );

  const resetMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  return {
    ...state,
    fetchPending,
    handleReviewApplication,
    fetchHierarchy,
    handleUpdateStatus,
    resetMessages,
  };
};

export default useFranchiseManage;