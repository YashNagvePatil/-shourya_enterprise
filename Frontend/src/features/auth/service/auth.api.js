import axios from "axios";

// 1. Axios Instance with Dynamic Base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Automatically includes cookies for all requests
});

// 2. Request Interceptor: Pass JWT token if stored in LocalStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor: Uniform Error Handling Across App
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract backend custom error message if available
    const customMessage =
      error.response?.data?.message || "Something went wrong. Please try again.";
    
    return Promise.reject(new Error(customMessage));
  }
);

// --- Auth API Helpers ---

// Login Helper (Handles Identifier / Email / Franchise / Admin Login)
export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data; // Returns { success: true, user, token, message }
};

// Register Helper
export const register = async (formData) => {
  const response = await api.post("/auth/register", formData);
  return response.data; // Returns { success: true, message, user, token }
};

// Logout Helper
export const logoutApi = async () => {
  // withCredentials is already inherited from the 'api' instance
  const response = await api.post("/auth/logout");
  return response.data;
};

export default api;