import axios from "axios";

export const paymentApi = axios.create({
  baseURL: "http://localhost:3000/api/payment",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 1. Request Interceptor (JWT Token attach karne ke liye)
paymentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor (Data Unwrap & Error Handling)
paymentApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg = error.response?.data?.message || "Something went wrong";
    return Promise.reject(new Error(errorMsg));
  }
);

// 3. Exported API Callers
export const createRazorpayOrder = async (payload) => {
  return await paymentApi.post("/create-order", payload);
};

export const verifyAndDistributeMLM = async (payload) => {
  return await paymentApi.post("/verify-and-distribute", payload);
};