import { useDispatch, useSelector } from "react-redux";
import { setError, setLoading, setUser,clearError,logout } from "../state/auth.slice.js";
import { register,login,logoutApi } from "../service/auth.api.js";

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
      dispatch(setLoading(true));
      dispatch(clearError());

      const data = await login(credentials);

      // 1. Safe User + Role Object Build
      // Agar backend `data.user` object bhej rha h ya alag se `data.role` bhej rha h, dono handle ho jayenge
      const userData = typeof data.user === 'object' 
        ? { ...data.user, role: data.user.role || data.role }
        : { name: data.user, role: data.role };

      // 2. LocalStorage me save karein (Persistence ke liye)
      localStorage.setItem("user", JSON.stringify(userData));

      // 3. Redux State me dispatch karein
      dispatch(setUser(userData));

      return { success: true, user: userData, message: data.message };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed!";
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }

 async function handleLogout() {
    try {
      dispatch(setLoading(true));
      // 1. Backend API Call (HttpOnly Cookie Delete karega)
      await logoutApi();
    } catch (err) {
      console.error("Logout API Error:", err);
    } finally {
      // 2. Client Side State Clear (Success ho ya Error)
      dispatch(logout()); // Redux reset + localStorage.removeItem("user")
      dispatch(setLoading(false));
    }
  }


  return {
    user,
    loading,
    error,
    handleRegister,
    handleLogin,
     handleLogout
  };
};