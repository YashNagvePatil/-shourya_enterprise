import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setError,
  setSuccessMessage,
  clearMessages,
  setSupplyRequests,
  updateSupplyRequest,
} from "../state/managefranchiseSupplySlice"; // Adjust path to your slice
import {
  getGlobalSupplyRequests,
  updateSupplyDispatchStatus,
} from "../service/franchiseManage.api"; // Adjust path to your API file

const useFranchiseSupply = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.ManagefranchiseSupply);

  const fetchSupplyRequests = useCallback(
    async (params = {}) => {
      dispatch(clearMessages());
      dispatch(setLoading({ key: "fetch", value: true }));
      try {
        const response = await getGlobalSupplyRequests(params);
        if (response.data?.success) {
          dispatch(
            setSupplyRequests({
              requests: response.data.requests,
              count: response.data.count,
            })
          );
        }
        return response.data;
      } catch (error) {
        const msg =
          error.response?.data?.message || "Failed to fetch supply requests";
        dispatch(setError(msg));
        throw error;
      } finally {
        dispatch(setLoading({ key: "fetch", value: false }));
      }
    },
    [dispatch]
  );

  const handleUpdateDispatchStatus = useCallback(
    async (requestId, dispatchData) => {
      dispatch(clearMessages());
      dispatch(setLoading({ key: "update", value: true }));
      try {
        const response = await updateSupplyDispatchStatus(
          requestId,
          dispatchData
        );
        if (response.data?.success) {
          dispatch(updateSupplyRequest(response.data.supplyReq));
          dispatch(setSuccessMessage(response.data.message || "Dispatch status updated successfully"));
        }
        return response.data;
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          "Failed to update supply dispatch status";
        dispatch(setError(msg));
        throw error;
      } finally {
        dispatch(setLoading({ key: "update", value: false }));
      }
    },
    [dispatch]
  );

  const resetMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  return {
    ...state,
    fetchSupplyRequests,
    handleUpdateDispatchStatus,
    resetMessages,
  };
};

export default useFranchiseSupply;