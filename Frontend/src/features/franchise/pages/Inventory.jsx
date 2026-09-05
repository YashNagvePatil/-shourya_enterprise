import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFranchise } from "../hooks/useFranchise";
import { useFranchiseInventory } from "../hooks/useFranchiseInventory";

const FranchiseInventory = () => {
  const { currentFranchise } = useFranchise();

  // Connect updated hook methods & state
  const {
    filteredItems,
    filters,
    loading,
    sellingLoading,
    error,
    fetchInventory,
    processSale, // Updated from sellItem
    setFilters,
  } = useFranchiseInventory();

  // Modal / Action State for selling item
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [sellQty, setSellQty] = useState(1);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Handle unit sale trigger
  const handleConfirmSale = async () => {
    if (!selectedInventoryItem) return;

    // Standardized product ID extraction (Populated or Raw Object ID)
    const targetProductId =
      selectedInventoryItem.productId?._id ||
      selectedInventoryItem.productId ||
      selectedInventoryItem.product?._id ||
      selectedInventoryItem.product;

    try {
      await processSale({
        productId: targetProductId,
        quantity: Number(sellQty),
      });

      // Clear Modal after successful transaction
      setSelectedInventoryItem(null);
      setSellQty(1);
    } catch (err) {
      console.error("Sale transaction failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-light text-[#3B2820] p-4 md:p-8">
      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto space-y-6">
        {/* Back to Dashboard Navigation Button */}
        <div>
          <Link
            to="/franchise/dashboard"
            className="inline-flex items-center gap-2 text-xs font-normal text-[#8C6247] hover:text-[#C68A53] bg-white border border-[#EADBCE] px-3.5 py-2 rounded-xl shadow-xs transition hover:bg-[#FDF9F3]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
        </div>
        {/* Header Title Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-[#EADBCE] shadow-sm gap-4">
          <div>
            <h1 className="text-xl font-light text-[#3B2820]">
              Inventory Management
            </h1>
            <p className="text-xs text-[#8C6247] font-light mt-0.5">
              Monitor product stock levels, update inventory, and process direct sales.
            </p>
          </div>
          <button
            onClick={fetchInventory}
            className="px-4 py-2 bg-[#FDF9F3] text-[#8C6247] border border-[#D9C4B1] rounded-lg text-xs hover:bg-[#F8EFE4] transition-all"
          >
            Refresh Stock
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 text-sm text-[#8C6247] bg-[#FDF9F3] border border-[#D9C4B1] rounded-xl">
            {error}
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white p-5 rounded-xl border border-[#EADBCE] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={filters.searchQuery || ""}
              onChange={(e) => setFilters({ searchQuery: e.target.value })}
              className="w-full bg-[#FFFDF9] border border-[#EADBCE] text-[#3B2820] placeholder-[#8C6247]/60 text-xs rounded-lg px-3.5 py-2.5 outline-none focus:border-[#C68A53] transition-colors"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({ category: e.target.value })}
              className="bg-[#FFFDF9] border border-[#EADBCE] text-[#8C6247] text-xs rounded-lg px-3 py-2.5 outline-none focus:border-[#C68A53]"
            >
              <option value="ALL">All Categories</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="SUPPLIES">Supplies</option>
              <option value="RETAIL">Retail Goods</option>
            </select>

            {/* Stock Status Filter Buttons */}
            <div className="flex bg-[#FDF9F3] p-1 rounded-lg border border-[#EADBCE] text-xs">
              {[
                { label: "All", value: "ALL" },
                { label: "In Stock", value: "IN_STOCK" },
                { label: "Low Stock", value: "LOW_STOCK" },
                { label: "Out of Stock", value: "OUT_OF_STOCK" },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFilters({ stockStatus: status.value })}
                  className={`px-3 py-1 rounded-md transition-all ${
                    filters.stockStatus === status.value
                      ? "bg-white text-[#3B2820] shadow-sm font-normal"
                      : "text-[#8C6247] hover:text-[#3B2820]"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl border border-[#EADBCE] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#8C6247] font-light">
              Loading inventory stock...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#8C6247] font-light">
              No products found matching your current filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FDF9F3] border-b border-[#EADBCE] text-[11px] uppercase tracking-wider text-[#8C6247] font-normal">
                    <th className="p-4">Product Name</th>
                    <th className="p-4">SKU / Code</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Unit Price</th>
                    <th className="p-4">Stock Level</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2E7DC] text-xs">
                  {filteredItems.map((item) => {
                    // Safe property extraction (Handles populated object & raw fallback)
                    const product = item.productId || item.product || {};
                    const productName = product.name || item.name || "Unknown Product";
                    const productSku = product.sku || item.sku || "N/A";
                    const productCategory = product.category || item.category || "General";
                    const unitPrice = item.sellingPrice || product.price || item.price || 0;
                    const stock = item.stock ?? item.quantity ?? 0;

                    const isLowStock = stock > 0 && stock <= 5;
                    const isOutOfStock = stock === 0;

                    return (
                      <tr
                        key={item._id || item.id}
                        className="hover:bg-[#FFFDF9] transition-colors"
                      >
                        <td className="p-4 font-normal text-[#3B2820]">
                          {productName}
                        </td>
                        <td className="p-4 text-[#8C6247] font-mono text-[11px]">
                          {productSku}
                        </td>
                        <td className="p-4 text-[#8C6247]">
                          {productCategory}
                        </td>
                        <td className="p-4 text-[#3B2820] font-normal">
                          ₹{unitPrice.toLocaleString()}
                        </td>
                        <td className="p-4 font-normal text-[#3B2820]">
                          {stock} units
                        </td>
                        <td className="p-4">
                          {isOutOfStock ? (
                            <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] rounded-full">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="px-2.5 py-1 bg-[#FDF9F3] text-[#C68A53] border border-[#D9C4B1] text-[10px] rounded-full">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] rounded-full">
                              Available
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            disabled={isOutOfStock}
                            onClick={() => setSelectedInventoryItem(item)}
                            className="px-3.5 py-1.5 bg-[#C68A53] text-white text-xs rounded-lg hover:bg-[#8C6247] disabled:bg-[#EADBCE] disabled:text-[#8C6247] transition-colors"
                          >
                            Sell Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Direct Sale Modal */}
      {selectedInventoryItem && (() => {
        const prod = selectedInventoryItem.productId || selectedInventoryItem.product || {};
        const name = prod.name || selectedInventoryItem.name || "Product";
        const price = selectedInventoryItem.sellingPrice || prod.price || selectedInventoryItem.price || 0;
        const currentStock = selectedInventoryItem.stock ?? selectedInventoryItem.quantity ?? 0;

        return (
          <div className="fixed inset-0 bg-[#3B2820]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-[#EADBCE] rounded-xl max-w-md w-full p-6 space-y-5 shadow-lg">
              <div>
                <h3 className="text-lg font-light text-[#3B2820]">
                  Process Sale: {name}
                </h3>
                <p className="text-xs text-[#8C6247] mt-0.5">
                  Current Stock: {currentStock} units | Price: ₹{price.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#8C6247] font-normal">
                  Quantity to Sell
                </label>
                <input
                  type="number"
                  min="1"
                  max={currentStock}
                  value={sellQty}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > currentStock) setSellQty(currentStock);
                    else if (val < 1) setSellQty(1);
                    else setSellQty(val);
                  }}
                  className="w-full bg-[#FFFDF9] border border-[#EADBCE] text-[#3B2820] text-sm rounded-lg p-2.5 outline-none focus:border-[#C68A53]"
                />
              </div>

              <div className="p-3 bg-[#FDF9F3] rounded-lg border border-[#EADBCE] flex justify-between items-center text-xs text-[#3B2820]">
                <span>Total Amount:</span>
                <span className="font-normal text-sm text-[#C68A53]">
                  ₹{(price * sellQty).toLocaleString()}
                </span>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => {
                    setSelectedInventoryItem(null);
                    setSellQty(1);
                  }}
                  className="px-4 py-2 border border-[#D9C4B1] text-[#8C6247] text-xs rounded-lg hover:bg-[#FDF9F3]"
                >
                  Cancel
                </button>
                <button
                  disabled={sellingLoading || currentStock <= 0}
                  onClick={handleConfirmSale}
                  className="px-4 py-2 bg-[#C68A53] text-white text-xs rounded-lg hover:bg-[#8C6247] disabled:opacity-50"
                >
                  {sellingLoading ? "Processing..." : "Confirm Sale"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default FranchiseInventory;