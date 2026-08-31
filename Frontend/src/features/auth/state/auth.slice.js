import { createSlice } from "@reduxjs/toolkit";

// Safe initial state loading from localStorage
const getSavedData = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token") || null;
    return { user, token };
  } catch (error) {
    console.error("Error reading auth data from localStorage:", error);
    return { user: null, token: null };
  }
};

const initialAuth = getSavedData();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: initialAuth.user,
    token: initialAuth.token,
    loading: false,
    error: null,
  },

  reducers: {
    // Single helper action to set both User (Distributor/Franchise/Admin) and Token
    setCredentials: (state, action) => {
      const { user, token } = action.payload || {};
      state.user = user || null;
      state.token = token || state.token;
      state.loading = false;
      state.error = null;

      if (user) localStorage.setItem("user", JSON.stringify(user));
      if (token) localStorage.setItem("token", token);
    },

    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("user");
      }
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const {
  setCredentials,
  setError,
  setLoading,
  setUser,
  clearError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;