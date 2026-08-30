import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/home",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor: Disable browser disk cache via Standard Headers
api.interceptors.request.use(
  (config) => {
    if (config.method?.toLowerCase() === "get") {
      // Standard No-Cache Headers (Bypasses 304 while keeping clean URLs for Redis)
      config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
      config.headers["Pragma"] = "no-cache";
      config.headers["Expires"] = "0";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Direct data unwrapping & error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

/**
 * Fetch list of products with optional filters
 * @param {Object} queryParams - Filtering, sorting & pagination parameters
 */
export const getProductData = async (queryParams = {}) => {
  return await api.get("/", { params: queryParams });
};

/**
 * Fetch details of a single product by ID
 * @param {string} id - Product ID
 * @param {Object} queryParams - Additional query options if any
 */
export const getProductDetails = async (id, queryParams = {}) => {
  return await api.get(`/${id}`, { params: queryParams });
};

export default api;