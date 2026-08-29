import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/admin",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enables cookies for authenticated admin routes
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
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

// ---------------------- Dashboard & Analytics ----------------------

export const getDashboardOverview = async () => {
  return await api.get("/dashboard/overview");
};

export const getNetworkAnalytics = async () => {
  return await api.get("/dashboard/analytics");
};

// ---------------------- Franchise & Onboarding Management ----------------------

export const getPendingApplications = async (params = {}) => {
  return await api.get("/applications/pending", { params });
};

export const reviewApplication = async (franchiseId, reviewData) => {
  return await api.patch(`/applications/${franchiseId}/review`, reviewData);
};

export const getFranchiseHierarchy = async () => {
  return await api.get("/franchises/hierarchy");
};

export const updateFranchiseStatus = async (franchiseId, statusData) => {
  return await api.patch(`/franchises/${franchiseId}/status`, statusData);
};

// ---------------------- Supply Management ----------------------

export const getGlobalSupplyRequests = async (params = {}) => {
  return await api.get("/supplies", { params });
};

export const updateSupplyDispatchStatus = async (requestId, dispatchData) => {
  return await api.patch(`/supplies/${requestId}/status`, dispatchData);
};

// ---------------------- Financials & Settlements ----------------------

// 1. Fetch Dashboard Analytics & Pending Withdrawals
export const getFinancialSummary = async () => {
  const response = await api.get("/financials/summary");
  return response.data;
};

// 2. Process Manual Payout Settlement (Rent, ROI, Commission)
export const processSettlement = async (settlementData) => {
  const response = await api.post("/financials/settle", settlementData);
  return response.data;
};

// 3. Review (Approve/Reject) Withdrawal Request (FIXED: Added reviewData payload)
export const reviewWithdrawalRequest = async (requestId, reviewData) => {
  const response = await api.patch(`/financials/withdrawal/${requestId}`, reviewData);
  return response.data;
};

// 4. Fetch Franchise Specific Passbook / Ledger History
export const getFranchiseFinancialLedger = async (franchiseId) => {
  const response = await api.get(`/financials/ledger/${franchiseId}`);
  return response.data;
};

export default api;