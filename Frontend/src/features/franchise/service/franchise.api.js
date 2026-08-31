import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/franchise",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor: Disable browser disk cache via Standard Headers
api.interceptors.request.use(
  (config) => {
    if (config.method?.toLowerCase() === "get") {
      // 1. HTTP Standard No-Cache Headers (Browser 304 response bypassed)
      config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
      config.headers["Pragma"] = "no-cache";
      config.headers["Expires"] = "0";

      // 2. Query Params CLEAN rakho (Redis ke liye)
      // _t timestamp param yahan se HATA DIYA GAYA HAI!
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
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

export const getDashboardAnalytics = async () =>{
  return await api.get("/analytics");
}

//-------------------decated profoile-----------------

// 2. Update Profile & Bank Details (PUT Request with payload)
export const updateFranchiseProfile = async (profileData) => {
  return await api.put("/profile/update", profileData);
};

// 3. Change Franchise Password (PUT Request with payload)
export const changeFranchisePassword = async (passwordData) => {
  return await api.put("/profile/change-password", passwordData);
};

// ---------------------- Supply Requests ----------------------

export const createSupplyRequest = async (requestData) => {
  return await api.post("/create-supply-request", requestData);
};

export const getSupplyRequestsForHierarchy = async (params) => {
  return await api.get("/get-supply-requests",{params});
};

// ---------------------- Inventory & Sales ----------------------

export const getInventory = async () => {
  return await api.get("/inventory");
};

export const sellFromInventory = async (saleData) => {
  return await api.post("/inventory/sell", saleData);
};


// finance 

export const  getFranchiseFinancialOverview = async () =>{
  return await api.get("/financials/overview")
}

export const getFranchisePassbook = async () =>{
  return await api.get("/financials/passbook")
}

export const  getFranchiseAnalytics = async (filter = "monthly") =>{
  return await api.get("/financials/analytics",{
   params: { filter },
  })
}

export const requestWithdrawal = async (amount, notes) =>{
  return await api.post("/financials/withdraw",{
     amount,notes
  })
}

export const  cancelWithdrawal = async (withdrawalId) =>{
  return await api.post("/financials/withdraw/cancel",{withdrawalId})
}
export default api;