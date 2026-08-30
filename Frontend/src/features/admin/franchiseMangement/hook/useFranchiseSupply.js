import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setError,
  setSuccessMessage,
  clearMessages,
  setSupplyRequests,
  updateSupplyRequest,
} from "../state/managefranchiseSupplySlice"; 
import {
  getGlobalSupplyRequests,
  updateSupplyDispatchStatus,
} from "../service/franchiseManage.api"; 

const useFranchiseSupply = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.ManagefranchiseSupply);

  // Helper to extract data seamlessly (handles both raw axios response & formatted response)
  const extractResponseData = (res) => (res && res.data ? res.data : res);

  const fetchSupplyRequests = useCallback(
    async (params = {}) => {
      dispatch(clearMessages());
      dispatch(setLoading({ key: "fetch", value: true }));
      try {
        const rawRes = await getGlobalSupplyRequests(params);
        const resData = extractResponseData(rawRes);

        if (resData?.success) {
          dispatch(
            setSupplyRequests({
              requests: resData.requests || resData.data?.requests || [],
              count: resData.count || resData.data?.count || 0,
            })
          );
        }
        return resData;
      } catch (error) {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch supply requests";
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
        const rawRes = await updateSupplyDispatchStatus(
          requestId,
          dispatchData
        );
        const resData = extractResponseData(rawRes);

        if (resData?.success) {
          // Robust checking for updated object
          const updatedObject = resData.supplyReq || resData.data;
          if (updatedObject) {
            dispatch(updateSupplyRequest(updatedObject));
          }

          dispatch(
            setSuccessMessage(
              resData.message || "Dispatch status updated successfully"
            )
          );
        }
        return resData;
      } catch (error) {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
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