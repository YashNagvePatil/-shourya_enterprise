import { useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setInventory,
  updateInventoryStock,
  setSelectedItem as setSelectedItemAction,
  setInventoryFilters as setInventoryFiltersAction,
  clearInventoryState,
  selectInventoryItems,
  selectSelectedItem,
  selectInventoryFilters,
} from "../state/franchiseInventory.slice"; // Adjust path as needed
import { getInventory, sellFromInventory } from "../service/franchise.api"; // Adjust path as needed

export const useFranchiseInventory = () => {
  const dispatch = useDispatch();

  // Redux States
  const items = useSelector(selectInventoryItems);
  const selectedItem = useSelector(selectSelectedItem);
  const filters = useSelector(selectInventoryFilters);

  // Local UI States for async status
  const [loading, setLoading] = useState(false);
  const [sellingLoading, setSellingLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetches full inventory data from the backend and updates Redux state
   */
  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getInventory();
      // Handle array vs object response structures safely
      const inventoryItems = Array.isArray(response)
        ? response
        : response.inventory || response.items || [];

      dispatch(setInventory(inventoryItems));
      return inventoryItems;
    } catch (err) {
      const errMsg = err.message || "Failed to fetch inventory";
      setError(errMsg);
      throw err;
    } 
  }, [dispatch]);

  /**
   * Sells item from inventory, updates backend, and updates Redux state locally
   * @param {Object} saleData - { productId, quantitySold, ... }
   */
  const handleSellItem = useCallback(
    async (saleData) => {
      setSellingLoading(true);
      setError(null);
      try {
        const response = await sellFromInventory(saleData);

        // Optimistically update stock in Redux slice
        dispatch(
          updateInventoryStock({
            productId: saleData.productId,
            quantitySold: Number(saleData.quantitySold),
          })
        );

        return response;
      } catch (err) {
        const errMsg = err.message || "Failed to complete sale";
        setError(errMsg);
        throw err;
      } finally {
        setSellingLoading(false);
      }
    },
    [dispatch]
  );

  /**
   * Sets the currently selected item in Redux
   */
  const setSelectedItem = useCallback(
    (item) => {
      dispatch(setSelectedItemAction(item));
    },
    [dispatch]
  );

  /**
   * Updates filter state in Redux (category, stockStatus, searchQuery)
   */
  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setInventoryFiltersAction(newFilters));
    },
    [dispatch]
  );

  /**
   * Resets inventory Redux state to initial state
   */
  const resetInventory = useCallback(() => {
    dispatch(clearInventoryState());
    setError(null);
  }, [dispatch]);

  /**
   * Derived/Filtered items computed on client side based on slice state filters
   */
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Search Query Filter (Matches Name or SKU)
      const matchesSearch =
        !filters.searchQuery ||
        item.name?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(filters.searchQuery.toLowerCase());

      // 2. Category Filter
      const matchesCategory =
        filters.category === "ALL" ||
        item.category?.toUpperCase() === filters.category.toUpperCase();

      // 3. Stock Status Filter
      let matchesStock = true;
      if (filters.stockStatus === "IN_STOCK") {
        matchesStock = item.stock > 5;
      } else if (filters.stockStatus === "LOW_STOCK") {
        matchesStock = item.stock > 0 && item.stock <= 5;
      } else if (filters.stockStatus === "OUT_OF_STOCK") {
        matchesStock = item.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [items, filters]);

  return {
    // Redux State Values
    items,
    filteredItems,
    selectedItem,
    filters,

    // Local UI Status
    loading,
    sellingLoading,
    error,

    // Actions & Handlers
    fetchInventory,
    sellItem: handleSellItem,
    setSelectedItem,
    setFilters,
    resetInventory,
  };
};

export default useFranchiseInventory;