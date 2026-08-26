import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  purchaseItem as purchaseItemApi,
  deductItemStock as deductItemStockApi,
  getInventoryItem as getInventoryItemApi,
} from "../service/inventory.api.js"; // Adjust import path to your axios api file

import {
  setInventoryLoading,
  setInventoryError,
  clearInventoryError,
  setSelectedItem,
  updateItemStockSuccess,
} from "../state/inventory.slice.js"; // Adjust import path to your slice file

/**
 * Production-ready custom hook to manage all inventory state and business logic
 */
export const useInventory = () => {
  const dispatch = useDispatch();

  // Extract Redux inventory state
  const { items, selectedItem, loading, error, lastUpdated } = useSelector(
    (state) => state.inventory
  );

  /**
   * Fetch single inventory item details by ID
   * @param {string} itemId - Database Object ID of the inventory item
   */
  const fetchInventoryItem = useCallback(
    async (itemId) => {
      if (!itemId) return;

      dispatch(setInventoryLoading(true));
      try {
        const response = await getInventoryItemApi(itemId);
        // Extract payload data
        const itemData = response?.data || response;
        
        dispatch(setSelectedItem(itemData));
        return itemData;
      } catch (err) {
        const errorMessage =
          err?.message || err?.response?.data?.message || "Failed to fetch item details";
        dispatch(setInventoryError(errorMessage));
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Purchase/Increase stock for an inventory item
   * @param {Object} payload - { itemId: string, quantity: number, purchasePrice?: number, supplierName?: string }
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

        // Dispatch updated stock item to sync Redux store state
        dispatch(updateItemStockSuccess(updatedItem));
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
   * @param {Object} payload - { itemId: string, quantity: number }
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

        // Dispatch updated stock item to sync Redux store state
        dispatch(updateItemStockSuccess(updatedItem));
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

  return {
    // Redux State
    items,
    selectedItem,
    loading,
    error,
    lastUpdated,

    // Actions & Business Logic
    fetchInventoryItem,
    purchaseStock,
    deductStock,
    clearError,
  };
};