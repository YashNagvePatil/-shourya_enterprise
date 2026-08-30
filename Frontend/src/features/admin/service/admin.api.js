import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor: Disable browser disk cache via Standard Headers
api.interceptors.request.use(
  (config) => {
    if (config.method?.toLowerCase() === "get") {
      config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
      config.headers["Pragma"] = "no-cache";
      config.headers["Expires"] = "0";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unwraps data and standardizes error responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

// ---------------------- Admin Agent & Management APIs ----------------------

export const getAgentsdata = async () => {
  return await api.get("/admin/dashboard");
};

export const getAgentList = async (queryParams = {}) => {
  return await api.get("/admin/agent/management", {
    params: queryParams,
  });
};

export const getAgentDetails = async (agentId, queryParams = {}) => {
  if (!agentId) {
    console.error("Agent ID is missing!");
    throw new Error("Agent ID missing for fetching details.");
  }

  return await api.get(`/admin/agent/${agentId}`, {
    params: queryParams,
  });
};

export const changeAgentStatus = async (agentId, status, reason = "") => {
  if (!agentId) {
    console.error(">>> [API ERROR] agentId passed to changeAgentStatus is invalid/undefined!");
    throw new Error("Agent ID missing for status change API call.");
  }

  return await api.patch(`/admin/agent/status/${agentId}`, {
    status, // "Active" or "Blocked"
    reason: status === "Blocked" ? reason : "",
  });
};

export const createProduct = async (productData) => {
  return await api.post("/admin/createProduct", productData);
};

export default api;