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
    if (config.method?.toLowerCase() === "get") {
      config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
      config.headers["Pragma"] = "no-cache";
      config.headers["Expires"] = "0";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Direct data unwrapping & standardized error responses
Agentapi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

/*
  =============================================================================
  1. GET REQUEST: FETCH CART
  =============================================================================
*/
export const getCart = async () => {
  return await Agentapi.get("/agent/getCart");
};

/*
  =============================================================================
  2. POST REQUEST: ADD / UPDATE CART ITEM
  =============================================================================
*/
export const addCart = async (cartData) => {
  // cartData = { productId: "12345", quantity: 1 }
  return await Agentapi.post("/agent/addCart", cartData);
};

/*
  =============================================================================
  3. DELETE REQUEST: REMOVE ITEM FROM CART
  =============================================================================
*/
export const removeProductFromCart = async (productId) => {
  return await Agentapi.delete(`/agent/${productId}`);
};

export default Agentapi;