import { createSlice } from "@reduxjs/toolkit";

// Initial state ko localStorage se check karke set karein
const savedUser = JSON.parse(localStorage.getItem("user") || "null");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: savedUser,
    loading: false, 
    error: null,
  },

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
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
      state.loading = false;
      state.error = null;
      localStorage.removeItem("user"); // Storage clear on logout
    },
  },
});

export const { setError, setLoading, setUser, clearError, logout } = authSlice.actions;

export default authSlice.reducer;