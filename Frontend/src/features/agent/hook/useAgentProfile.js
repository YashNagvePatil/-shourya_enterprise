import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setProfileLoading,
  setProfileUpdating,
  setProfileError,
  clearProfileMessages,
  setProfileData,
  updateProfileSuccess,
  updateKYCSuccess,
  updateBankDetailsSuccess,
} from "../state/agentProfile.slice"; // Aapka Redux path Adjust kar lein
import {
  getAgentProfile,
  updateAgentProfile,
  submitAgentKYC,
  updateBankDetails,
} from "../service/agent.api";

export const useAgentProfile = () => {
  const dispatch = useDispatch();

  // Redux Selectors
  const {
    profileData,
    kycData,
    bankDetails,
    address,
    loading,
    updating,
    error,
    successMessage,
  } = useSelector((state) => state.agentProfile);

  // 1. Fetch Profile Details
  const fetchProfile = useCallback(async () => {
    dispatch(setProfileLoading(true));
    try {
      const cacheBuster = `?t=${Date.now()}`;
      const response = await getAgentProfile(cacheBuster);

      if (response?.success) {
        dispatch(setProfileData(response.data));
      } else {
        dispatch(setProfileError(response?.message || "Failed to fetch profile"));
      }
    } catch (err) {
      dispatch(setProfileError(err.message));
    } finally {
      dispatch(setProfileLoading(false));
    }
  }, [dispatch]);

  // 2. Update Basic Profile & Address
  const handleUpdateProfile = useCallback(
    async (profilePayload) => {
      dispatch(setProfileUpdating(true));
      try {
        const response = await updateAgentProfile(profilePayload);

        if (response?.success) {
          dispatch(updateProfileSuccess(response.data));
          return { success: true, message: response.message };
        } else {
          dispatch(setProfileError(response?.message || "Profile update failed"));
          return { success: false, message: response.message };
        }
      } catch (err) {
        dispatch(setProfileError(err.message));
        return { success: false, message: err.message };
      } finally {
        dispatch(setProfileUpdating(false));
      }
    },
    [dispatch]
  );

  // 3. Submit KYC Documents
  const handleSubmitKYC = useCallback(
    async (kycPayload) => {
      dispatch(setProfileUpdating(true));
      try {
        const response = await submitAgentKYC(kycPayload);

        if (response?.success) {
          dispatch(updateKYCSuccess(response.data));
          return { success: true, message: response.message };
        } else {
          dispatch(setProfileError(response?.message || "KYC submission failed"));
          return { success: false, message: response.message };
        }
      } catch (err) {
        dispatch(setProfileError(err.message));
        return { success: false, message: err.message };
      } finally {
        dispatch(setProfileUpdating(false));
      }
    },
    [dispatch]
  );

  // 4. Update Bank Details
  const handleUpdateBankDetails = useCallback(
    async (bankPayload) => {
      dispatch(setProfileUpdating(true));
      try {
        const response = await updateBankDetails(bankPayload);

        if (response?.success) {
          dispatch(updateBankDetailsSuccess(response.data));
          return { success: true, message: response.message };
        } else {
          dispatch(setProfileError(response?.message || "Bank details update failed"));
          return { success: false, message: response.message };
        }
      } catch (err) {
        dispatch(setProfileError(err.message));
        return { success: false, message: err.message };
      } finally {
        dispatch(setProfileUpdating(false));
      }
    },
    [dispatch]
  );

  // Clear Messages Handler
  const resetMessages = useCallback(() => {
    dispatch(clearProfileMessages());
  }, [dispatch]);

  return {
    // States
    profileData,
    kycData,
    bankDetails,
    address,
    isLoading: loading,
    isUpdating: updating,
    error,
    successMessage,

    // API Actions
    fetchProfile,
    updateProfile: handleUpdateProfile,
    submitKYC: handleSubmitKYC,
    updateBank: handleUpdateBankDetails,
    resetMessages,
  };
};