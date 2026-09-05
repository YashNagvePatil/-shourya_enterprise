import axios from "axios";

// Create an Axios instance with base configuration
const inventoryApi = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor: Standard HTTP No-Cache Headers (304 Bypass for GET)
inventoryApi.interceptors.request.use(
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

// Response Interceptor: Unwrap data & Standardize Errors
inventoryApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

/**
 * Purchase / Add stock to an inventory item
 * @param {Object} payload - { itemId, quantity, purchasePrice, supplierName }
 */
export const purchaseItem = async (payload) => {
  return await inventoryApi.post("/admin/inventory/purchase", payload);
};

/**
 * Sell / Deduct stock from an inventory item
 * @param {Object} payload - { itemId, quantity }
 */
export const deductItemStock = async (payload) => {
  return await inventoryApi.post("/admin/inventory/deduct", payload);
};

/**
 * Fetch all inventory items / products
 */
export const getAllInventoryItems = async () => {
  return await inventoryApi.get("/admin/inventory/list");
};

/**
 * Fetch inventory details by item ID
 * @param {string} itemId - The ID of the inventory item
 */
export const getInventoryItem = async (itemId) => {
  return await inventoryApi.get(`/admin/inventory/${itemId}`);
};

export default inventoryApi;