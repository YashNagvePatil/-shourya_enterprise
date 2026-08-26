import axios from "axios";

// Create an Axios instance with base configuration
const inventoryApi = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Purchase / Add stock to an inventory item
 * @param {Object} payload - Object containing { itemId, quantity, purchasePrice, supplierName }
 * @returns {Promise<Object>} API response data
 */
export const purchaseItem = async (payload) => {
  try {
    const response = await inventoryApi.post("/admin/inventory/purchase", payload);
    return response.data;
  } catch (error) {
    // Return backend error message or general network error
    throw error.response?.data || error;
  }
};

/**
 * Sell / Deduct stock from an inventory item
 * @param {Object} payload - Object containing { itemId, quantity }
 * @returns {Promise<Object>} API response data
 */
export const deductItemStock = async (payload) => {
  try {
    const response = await inventoryApi.post("/admin/inventory/deduct", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Fetch inventory details by item ID
 * @param {string} itemId - The ID of the inventory item
 * @returns {Promise<Object>} API response data
 */
export const getInventoryItem = async (itemId) => {
  try {
    const response = await inventoryApi.get(`/admin/inventory/${itemId}`, {
      params: {
        _t: Date.now(), // Cache-busting parameter
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};