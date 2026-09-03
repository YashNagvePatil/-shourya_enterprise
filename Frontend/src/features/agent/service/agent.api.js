import axios from "axios";

const Agentapi = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor: Disable browser disk cache via Standard Headers
Agentapi.interceptors.request.use(
  (config) => {
    // 1. Authorization Token attached if stored locally
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method?.toLowerCase() === "get") {
      // 2. HTTP Standard No-Cache Headers (Browser 304 response bypassed)
      config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
      config.headers["Pragma"] = "no-cache";
      config.headers["Expires"] = "0";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Direct Data Unwrapping & Error Clean-up
Agentapi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Auto logout on 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

// ---------------------- Existing Agent Protected APIs ----------------------

export const getAgentData = async (cacheBuster = "") => {
  return await Agentapi.get(`/agent/dashBoard${cacheBuster}`);
};

export const getAgentNetworkData = async (cacheBuster = "") => {
  return await Agentapi.get(`/agent/networkTree${cacheBuster}`);
};

export const getAgentWalletData = async (cacheBuster = "") => {
  return await Agentapi.get(`/agent/wallet${cacheBuster}`);
};


export const  withdrawalRequests = async (withdrawalData) => {
  return await Agentapi.post("/agent/wallet/withdrawalRequests", withdrawalData);
}

// ---------------------- NEW: Agent Profile APIs ----------------------

/**
 * Fetch full profile details (KYC, Bank info, address, etc.)
 */
export const getAgentProfile = async (cacheBuster = "") => {
  return await Agentapi.get(`/agent/profile${cacheBuster}`);
};

/**
 * Update personal basic details and shipping address
 * @param {Object} profileData - { fullName, contact, address: { street, city, state, pincode } }
 */
export const updateAgentProfile = async (profileData) => {
  return await Agentapi.put("/agent/profile/update", profileData);
};

/**
 * Submit or update KYC documents
 * @param {Object} kycData - { panCardImage, adharCardImage }
 */
export const submitAgentKYC = async (kycData) => {
  return await Agentapi.post("/agent/profile/kyc", kycData);
};

/**
 * Update Bank & UPI details for payouts
 * @param {Object} bankData - { accountNumber, ifscCode, bankName, accountHolderName, upiId }
 */
export const updateBankDetails = async (bankData) => {
  return await Agentapi.put("/agent/profile/bank-details", bankData);
};

export default Agentapi;