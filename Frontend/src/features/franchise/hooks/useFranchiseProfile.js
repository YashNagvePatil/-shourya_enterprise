import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  changePasswordStart,
  changePasswordSuccess,
  changePasswordFailure,
  resetProfileState as resetStateAction,
  clearProfileErrors as clearErrorsAction,
  clearStatusFlags as clearFlagsAction,
} from "../state/franchiseProfile.slice";
import {
  getFranchiseProfile,
  updateFranchiseProfile,
  changeFranchisePassword,
} from "../service/franchise.api"; 

export const useFranchiseProfile = () => {
  const dispatch = useDispatch();

  // Redux Selectors
  const {
    profile,
    isProfileLoading,
    isUpdatingProfile,
    isChangingPassword,
    profileError,
    updateError,
    passwordError,
    updateSuccess,
    passwordSuccess,
  } = useSelector((state) => state.franchiseProfile);

  // 1. Fetch Profile Logic
  const fetchProfile = useCallback(async () => {
    dispatch(fetchProfileStart());
    try {
      const response = await getFranchiseProfile();
      if (response.success) {
        dispatch(fetchProfileSuccess(response.data));
      } else {
        dispatch(
          fetchProfileFailure(response.message || "Failed to fetch profile")
        );
      }
    } catch (err) {
      // Standardized interceptor error message
      dispatch(fetchProfileFailure(err.message || "Server Error"));
    }
  }, [dispatch]);

  // 2. Update Profile Logic
  const updateProfile = useCallback(
    async (profileData) => {
      dispatch(updateProfileStart());
      try {
        const response = await updateFranchiseProfile(profileData);
        if (response.success) {
          dispatch(updateProfileSuccess(response.data));
          return { success: true, message: response.message };
        } else {
          dispatch(
            updateProfileFailure(response.message || "Failed to update profile")
          );
          return { success: false, message: response.message };
        }
      } catch (err) {
        const errorMsg = err.message || "Failed to update profile";
        dispatch(updateProfileFailure(errorMsg));
        return { success: false, message: errorMsg };
      }
    },
    [dispatch]
  );

  // 3. Change Password Logic
  const changePassword = useCallback(
    async (passwordData) => {
      dispatch(changePasswordStart());
      try {
        const response = await changeFranchisePassword(passwordData);
        if (response.success) {
          dispatch(changePasswordSuccess());
          return { success: true, message: response.message };
        } else {
          dispatch(
            changePasswordFailure(response.message || "Failed to change password")
          );
          return { success: false, message: response.message };
        }
      } catch (err) {
        const errorMsg = err.message || "Failed to change password";
        dispatch(changePasswordFailure(errorMsg));
        return { success: false, message: errorMsg };
      }
    },
    [dispatch]
  );

  // Helper Dispatches
  const resetProfileState = useCallback(() => {
    dispatch(resetStateAction());
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearErrorsAction());
  }, [dispatch]);

  const clearFlags = useCallback(() => {
    dispatch(clearFlagsAction());
  }, [dispatch]);

  return {
    // Redux State
    profile,
    isProfileLoading,
    isUpdatingProfile,
    isChangingPassword,
    profileError,
    updateError,
    passwordError,
    updateSuccess,
    passwordSuccess,

    // Actions & API Callers
    fetchProfile,
    updateProfile,
    changePassword,
    resetProfileState,
    clearErrors,
    clearFlags,
  };
};