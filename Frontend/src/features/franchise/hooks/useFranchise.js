import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { franchiseRegister, franchiseLogin } from "../service/franchise.api.js"; // Adjust import path
import {
  setFranchiseLoading,
  setFranchiseError,
  clearFranchiseError,
  registrationSuccess,
  resetRegistrationState,
  loginSuccess,        // Imported for handling login state
  logoutSuccess,        // Imported for handling logout state
} from "../state/franchiseUser.slice.js"; // Adjust import path

/**
 * Custom Hook to handle all Franchise related state & logic
 */
export const useFranchise = () => {
  const dispatch = useDispatch();

  const {
    currentFranchise,
    isAuthenticated,
    isRegisteredSuccess,
    registeredFranchiseId,
    loading,
    error,
  } = useSelector((state) => state.franchise);

  /**
   * Helper utility to convert a File object to a Base64 string
   * @param {File} file 
   * @returns {Promise<String>}
   */
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) resolve(null);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
  };

  /**
   * Submit Franchise Registration
   * Accepts plain object (with raw files or base64 strings) or FormData
   * @param {Object|FormData} payload 
   */
  const submitRegistration = useCallback(
    async (payload) => {
      dispatch(setFranchiseLoading(true));
      dispatch(clearFranchiseError());

      try {
        let finalPayload = payload;

        // If payload is a plain object containing File instances for images, auto-convert them to Base64
        if (!(payload instanceof FormData) && typeof payload === "object") {
          const [firmDocs, shopLicense, panCardImage, aadhaarCardImage] =
            await Promise.all([
              payload.firmDocs instanceof File
                ? convertFileToBase64(payload.firmDocs)
                : payload.firmDocs,
              payload.shopLicense instanceof File
                ? convertFileToBase64(payload.shopLicense)
                : payload.shopLicense,
              payload.panCardImage instanceof File
                ? convertFileToBase64(payload.panCardImage)
                : payload.panCardImage,
              payload.aadhaarCardImage instanceof File
                ? convertFileToBase64(payload.aadhaarCardImage)
                : payload.aadhaarCardImage,
            ]);

          finalPayload = {
            ...payload,
            firmDocs,
            shopLicense,
            panCardImage,
            aadhaarCardImage,
          };
        }

        const response = await franchiseRegister(finalPayload);

        dispatch(registrationSuccess(response));
        return response;
      } catch (err) {
        const errorMessage = err.message || "Registration failed. Please try again.";
        dispatch(setFranchiseError(errorMessage));
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Submit Franchise Login
   * @param {Object} credentials - { email, password }
   */
  const submitLogin = useCallback(
    async (credentials) => {
      dispatch(setFranchiseLoading(true));
      dispatch(clearFranchiseError());

      try {
        const response = await franchiseLogin(credentials);

        // Store franchise data in Redux state upon successful authentication
        dispatch(loginSuccess(response));
        return response;
      } catch (err) {
        const errorMessage = err.message || "Login failed. Please check your credentials.";
        dispatch(setFranchiseError(errorMessage));
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Franchise Logout
   */
  const logout = useCallback(() => {
    dispatch(logoutSuccess());
  }, [dispatch]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch(clearFranchiseError());
  }, [dispatch]);

  /**
   * Reset registration status (useful when navigating away from success page)
   */
  const resetRegistration = useCallback(() => {
    dispatch(resetRegistrationState());
  }, [dispatch]);

  return {
    // State
    currentFranchise,
    isAuthenticated,
    isRegisteredSuccess,
    registeredFranchiseId,
    loading,
    error,

    // Methods & Logic
    submitRegistration,
    submitLogin,
    logout,
    convertFileToBase64,
    clearError,
    resetRegistration,
  };
};