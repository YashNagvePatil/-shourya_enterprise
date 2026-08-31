import { useDispatch, useSelector } from "react-redux";
import {
  setError,
  setLoading,
  setCredentials,
  clearError,
  logout,
} from "../state/auth.slice.js";
import { register, login, logoutApi } from "../service/auth.api.js";

export const useAuth = () => {
  const dispatch = useDispatch();

  // Redux state access
  const { user, token, loading, error } = useSelector((state) => state.auth);

  // 1. Handle Registration
  async function handleRegister(formData) {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const data = await register(formData);

      // Save user & token in Redux + localStorage
      dispatch(
        setCredentials({
          user: data.user,
          token: data.token,
        })
      );

      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      const errorMessage = err.message || "Registration failed!";
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }

  // 2. Handle Unified Login (Distributor, Franchise, Admin)
  async function handleLogin(credentials) {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const data = await login(credentials);

      // Safe User + Role Object Construction
      const userData =
        typeof data.user === "object"
          ? { ...data.user, role: data.user.role || data.role }
          : { name: data.user, role: data.role };

      // Single action dispatches user + token to Redux & auto-syncs localStorage
      dispatch(
        setCredentials({
          user: userData,
          token: data.token,
        })
      );

      return { success: true, user: userData, message: data.message };
    } catch (err) {
      const errorMessage = err.message || "Login failed!";
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }

  // 3. Handle Logout
  async function handleLogout() {
    try {
      dispatch(setLoading(true));
      // Backend HttpOnly Cookie clear request
      await logoutApi();
    } catch (err) {
      console.error("Logout API Error:", err);
    } finally {
      // Client-side state + localStorage reset (runs regardless of API success/failure)
      dispatch(logout());
      dispatch(setLoading(false));
    }
  }

  return {
    user,
    token,
    loading,
    error,
    handleRegister,
    handleLogin,
    handleLogout,
  };
};

export default useAuth;