import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/franchise",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enables cookies for authenticated routes
});

// Request Interceptor: Automatically appends a unique timestamp (_t) to all GET requests to bypass browser caching (304 responses)
api.interceptors.request.use(
  (config) => {
    if (config.method?.toLowerCase() === "get") {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unwraps data and standardizes error responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

// ---------------------- Public APIs ----------------------

export const franchiseRegister = async (formData) => {
  const isFormData = formData instanceof FormData;
  return await api.post("/register", formData, {
    headers: {
      "Content-Type": isFormData ? "multipart/form-data" : "application/json",
    },
  });
};

export const franchiseLogin = async (credentials) => {
  return await api.post("/login", credentials);
};

// ---------------------- Protected Dashboard APIs ----------------------

export const getFranchiseProfile = async () => {
  return await api.get("/profile");
};

export const getFinancialOverview = async () => {
  return await api.get("/financials");
};

// ---------------------- Supply Requests ----------------------

export const createSupplyRequest = async (requestData) => {
  return await api.post("/create-supply-request", requestData);
};

export const getSupplyRequestsForHierarchy = async () => {
  return await api.get("/get-supply-requests");
};

// ---------------------- Inventory & Sales ----------------------

export const getInventory = async () => {
  return await api.get("/inventory");
};

export const sellFromInventory = async (saleData) => {
  return await api.post("/inventory/sell", saleData);
};

export default api;