import { useDispatch, useSelector } from "react-redux";
import { setError, setLoading, setUser,clearError } from "../state/auth.slice.js";
import { register,login } from "../service/auth.api.js";

export const useAuth = () => {
  const dispatch = useDispatch();

  // Redux state access
  const { user, loading, error } = useSelector((state) => state.auth);

  async function handleRegister(formData) {
    try {
      // 1. Loading Start
      dispatch(setLoading(true));
      dispatch(setError(null));

      // 2. API Call
      const data = await register(formData);

      // 3. Save User to Redux State
      dispatch(setUser(data.user));

      return { success: true, user: data.user };
    } catch (err) {
      // 4. Handle Error
      const errorMessage =
        err.response?.data?.message || err.message || "Registration failed!";
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogin(credentials) {
    try {
      // 1. Loading Start & Error Clear
      dispatch(setLoading(true));
      dispatch(clearError());

      // 2. API Call (credentials = { identifier: "...", password: "..." })
      const data = await login(credentials);

      // 3. Save User to Redux State
      dispatch(setUser(data.user));

      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      // 4. Handle Error
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed!";
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    user,
    loading,
    error,
    handleRegister,
    handleLogin
  };
};