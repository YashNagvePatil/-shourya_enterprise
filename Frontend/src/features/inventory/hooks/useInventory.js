import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  purchaseItem as purchaseItemApi,
  deductItemStock as deductItemStockApi,
  getInventoryItem as getInventoryItemApi,
  getAllInventoryItems as getAllInventoryItemsApi,
} from "../service/inventory.api.js";

import {
  setInventoryLoading,
  setInventoryError,
  clearInventoryError,
  setSelectedItem,
  setInventoryItems,
  updateItemStockSuccess,
  stockOperationCompleted,
  setNotFoundProductInfo,
  resetStockOperation,
} from "../state/inventory.slice.js";

/**
 * Production-ready custom hook to manage all inventory state and business logic
 */
export const useInventory = () => {
  const dispatch = useDispatch();

  // Extract Redux inventory state (naye fields bhi include kiye)
  const {
    items,
    selectedItem,
    loading,
    error,
    lastUpdated,
    operationStatus,       // ← NEW: "purchase_success" | "deduct_success" | null
    notFoundProductInfo,   // ← NEW: product info jab inventory na ho
    stockOperationSuccess, // ← NEW: form reset/modal close ke liye
  } = useSelector((state) => state.inventory);

  /**
   * Fetch single inventory item details by ID
   * Handles 404 case: product exist karta hai par inventory nahi
   */
  const fetchInventoryItem = useCallback(
    async (itemId) => {
      if (!itemId) return;

      dispatch(setInventoryLoading(true));
      dispatch(setNotFoundProductInfo(null)); // ← Pehla call pe clear karo
      try {
        const response = await getInventoryItemApi(itemId);
        const itemData = response?.data || response;
        dispatch(setSelectedItem(itemData));
        return itemData;
      } catch (err) {
        // ← NEW: Backend 404 pe productInfo bhejtaa hai (inventory nahi, product hai)
        // Yeh case "Please purchase stock first" ke liye hai
        const productInfo = err?.response?.data?.productInfo;
        if (productInfo) {
          dispatch(setNotFoundProductInfo(productInfo));
        } else {
          const errorMessage =
            err?.message || err?.response?.data?.message || "Failed to fetch item details";
          dispatch(setInventoryError(errorMessage));
        }
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Purchase/Increase stock for an inventory item
   * @param {Object} payload - { itemId, quantity, purchasePrice?, wholesalerPrice? }
   */
  const purchaseStock = useCallback(
    async (payload) => {
      if (!payload?.itemId || !payload?.quantity || payload.quantity <= 0) {
        const validationError = "Valid item ID and positive quantity are required.";
        dispatch(setInventoryError(validationError));
        throw new Error(validationError);
      }

      dispatch(setInventoryLoading(true));
      try {
        const response = await purchaseItemApi(payload);
        const updatedItem = response?.data || response;

        // Redux store mein item update karo
        dispatch(updateItemStockSuccess(updatedItem));

        // ← NEW: Purchase success status set karo (UI toast ke liye)
        dispatch(stockOperationCompleted("purchase_success"));
        return response;
      } catch (err) {
        const errorMessage =
          err?.message || err?.response?.data?.message || "Failed to add stock";
        dispatch(setInventoryError(errorMessage));
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Sell/Deduct stock from an inventory item
   * @param {Object} payload - { itemId, quantity }
   */
  const deductStock = useCallback(
    async (payload) => {
      if (!payload?.itemId || !payload?.quantity || payload.quantity <= 0) {
        const validationError = "Valid item ID and positive quantity are required.";
        dispatch(setInventoryError(validationError));
        throw new Error(validationError);
      }

      dispatch(setInventoryLoading(true));
      try {
        const response = await deductItemStockApi(payload);
        const updatedItem = response?.data || response;

        // Redux store mein item update karo
        dispatch(updateItemStockSuccess(updatedItem));

        // ← NEW: Deduct success status set karo (UI toast ke liye)
        dispatch(stockOperationCompleted("deduct_success"));
        return response;
      } catch (err) {
        const errorMessage =
          err?.message || err?.response?.data?.message || "Failed to deduct stock";
        dispatch(setInventoryError(errorMessage));
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Dismiss/Clear Redux inventory error state
   */
  const clearError = useCallback(() => {
    dispatch(clearInventoryError());
  }, [dispatch]);

  /**
   * ← NEW: Toast dikhane ke baad success flags reset karo
   * Component mein useEffect ke andar call karo jab stockOperationSuccess true ho
   */
  const resetOperationStatus = useCallback(() => {
    dispatch(resetStockOperation());
  }, [dispatch]);

  /**
   * Fetch all inventory items / products list
   */
  const fetchAllInventoryItems = useCallback(async () => {
    dispatch(setInventoryLoading(true));
    try {
      const response = await getAllInventoryItemsApi();
      const itemsList = response?.data || response || [];
      dispatch(setInventoryItems(itemsList));
      return itemsList;
    } catch (err) {
      const errorMessage =
        err?.message || err?.response?.data?.message || "Failed to fetch inventory list";
      dispatch(setInventoryError(errorMessage));
      throw err;
    }
  }, [dispatch]);

  return {
    // Redux State
    items,
    selectedItem,
    loading,
    error,
    lastUpdated,

    // Operation tracking state
    operationStatus,
    notFoundProductInfo,
    stockOperationSuccess,

    // Actions & Business Logic
    fetchAllInventoryItems,
    fetchInventoryItem,
    purchaseStock,
    deductStock,
    clearError,
    resetOperationStatus,
  };
};
