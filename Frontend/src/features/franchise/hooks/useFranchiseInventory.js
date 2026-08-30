import { useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setInventory,
  updateInventoryStock,
  setSelectedItem as setSelectedAction,
  setInventoryFilters as setFiltersAction,
  clearInventoryState,
  selectInventoryItems,
  selectSelectedItem,
  selectInventoryFilters,
} from "../state/franchiseInventory.slice"; // Adjust path as needed

import {
  getInventory as getInventoryApi,
  sellFromInventory as sellFromInventoryApi,
} from "../service/franchise.api"; // Adjust path as needed

export const useFranchiseInventory = () => {
  const dispatch = useDispatch();

  // Redux States
  const items = useSelector(selectInventoryItems);
  const selectedItem = useSelector(selectSelectedItem);
  const filters = useSelector(selectInventoryFilters);

  // Local Loading & Error States
  const [loading, setLoading] = useState(false);
  const [sellingLoading, setSellingLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 1. Fetch Inventory from Backend
   */
  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getInventoryApi();
      const inventoryList = response.inventory || response.data || [];
      dispatch(setInventory(inventoryList));
      return inventoryList;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to fetch inventory";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  /**
   * 2. Process POS Direct Sale (Customer Billing)
   * @param {Object} payload - { productId, quantity }
   */
  const processSale = useCallback(
    async (payload) => {
      setSellingLoading(true);
      setError(null);
      try {
        const response = await sellFromInventoryApi(payload);

        if (response.success) {
          // Optimistic/Confirmed Redux State Update
          dispatch(
            updateInventoryStock({
              productId: payload.productId,
              quantitySold: Number(payload.quantity),
            })
          );
        }
        return response;
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message || "Failed to process sale";
        setError(errMsg);
        throw new Error(errMsg);
      } finally {
        setSellingLoading(false);
      }
    },
    [dispatch]
  );

  /**
   * 3. Set Active Selected Item (For UI Modals / POS Cart)
   */
  const setSelectedItem = useCallback(
    (item) => {
      dispatch(setSelectedAction(item));
    },
    [dispatch]
  );

  /**
   * 4. Update Inventory Filters
   */
  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setFiltersAction(newFilters));
    },
    [dispatch]
  );

  /**
   * 5. Reset Inventory State
   */
  const resetInventoryState = useCallback(() => {
    dispatch(clearInventoryState());
    setError(null);
  }, [dispatch]);

  /**
   * 6. Optimized Client-Side Filtered Items Computation
   */
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const product = item.productId || item.product || {};

      // Category Matching
      const matchesCategory =
        filters.category === "ALL" ||
        product.category?.toLowerCase() === filters.category?.toLowerCase();

      // Search Matching (Name, SKU)
      const query = filters.searchQuery?.toLowerCase().trim();
      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        item.sku?.toLowerCase().includes(query);

      // Stock Status Logic
      const currentStock = item.stock ?? item.quantity ?? 0;
      let matchesStock = true;

      if (filters.stockStatus === "IN_STOCK") {
        matchesStock = currentStock > 5;
      } else if (filters.stockStatus === "LOW_STOCK") {
        matchesStock = currentStock > 0 && currentStock <= 5;
      } else if (filters.stockStatus === "OUT_OF_STOCK") {
        matchesStock = currentStock === 0;
      }

      return matchesCategory && matchesSearch && matchesStock;
    });
  }, [items, filters]);

  return {
    // Redux State
    items,
    filteredItems,
    selectedItem,
    filters,

    // Status
    loading,
    sellingLoading,
    error,

    // Methods & Actions
    fetchInventory,
    processSale,
    setSelectedItem,
    setFilters,
    resetInventoryState,
  };
};

export default useFranchiseInventory;