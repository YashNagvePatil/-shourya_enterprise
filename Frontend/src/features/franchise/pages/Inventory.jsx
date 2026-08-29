import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useFranchise } from "../hooks/useFranchise";
import { useFranchiseInventory } from "../hooks/useFranchiseInventory";

const FranchiseInventory = () => {
  const { currentFranchise } = useFranchise();
  const location = useLocation();

  // Connect state & methods from inventory custom hook
  const {
    filteredItems,
    filters,
    loading,
    sellingLoading,
    error,
    fetchInventory,
    sellItem,
    setFilters,
  } = useFranchiseInventory();

  // Modal / Action State for selling item
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sellQty, setSellQty] = useState(1);
  const [activeTab, setActiveTab] = useState("inventory");

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Handle unit sale trigger
  const handleConfirmSale = async () => {
    if (!selectedProduct) return;
    try {
      await sellItem({
        productId: selectedProduct._id || selectedProduct.id,
        quantitySold: Number(sellQty),
      });
      setSelectedProduct(null);
      setSellQty(1);
    } catch (err) {
      console.error("Sale error:", err);
    }
  };

  // Sidebar Navigation Links
  const navItems = [
    {
      name: "Dashboard",
      path: "/franchise/dashboard",
      id: "dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Inventory",
      path: "/franchise/inventory",
      id: "inventory",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      name: "Supply",
      path: "/franchise/supply",
      id: "supply",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      name: "Finance",
      path: "/franchise/finance",
      id: "finance",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#FFFDF9] font-light text-[#3B2820]">
      {/* Fixed Left Navigation Sidebar */}
      <aside className="w-64 bg-white border-r border-[#D9C4B1]/50 fixed h-full flex flex-col justify-between z-20">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#F2E7DC]">
            <h2 className="text-lg font-normal tracking-wide text-[#3B2820] uppercase">
              Apex Franchise
            </h2>
            <p className="text-xs text-[#C68A53] mt-0.5 uppercase tracking-wider font-normal">
              {currentFranchise?.franchiseType || "DISTRICT"} PORTAL
            </p>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive =
                activeTab === item.id || location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm transition-all ${
                    isActive
                      ? "bg-[#C68A53] text-white font-normal shadow-sm shadow-[#C68A53]/30"
                      : "text-[#8C6247] hover:bg-[#FDF9F3] hover:text-[#3B2820]"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account Footer Summary */}
        <div className="p-4 m-4 bg-[#FDF9F3] rounded-xl border border-[#EADBCE] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#EADBCE] text-[#8C6247] flex items-center justify-center font-normal text-sm border border-[#D9C4B1]">
            {currentFranchise?.fullName?.charAt(0) || "F"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-normal text-[#3B2820] truncate">
              {currentFranchise?.fullName || "Franchise Partner"}
            </p>
            <p className="text-[10px] text-[#8C6247] truncate">
              {currentFranchise?.email || "partner@apex.com"}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 space-y-6">
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
              value={filters.searchQuery}
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
                    const isLowStock = item.stock > 0 && item.stock <= 5;
                    const isOutOfStock = item.stock === 0;

                    return (
                      <tr
                        key={item._id || item.id}
                        className="hover:bg-[#FFFDF9] transition-colors"
                      >
                        <td className="p-4 font-normal text-[#3B2820]">
                          {item.name}
                        </td>
                        <td className="p-4 text-[#8C6247] font-mono text-[11px]">
                          {item.sku || "N/A"}
                        </td>
                        <td className="p-4 text-[#8C6247]">
                          {item.category || "General"}
                        </td>
                        <td className="p-4 text-[#3B2820] font-normal">
                          ₹{item.price?.toLocaleString() || 0}
                        </td>
                        <td className="p-4 font-normal text-[#3B2820]">
                          {item.stock} units
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
                            onClick={() => setSelectedProduct(item)}
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
      {selectedProduct && (
        <div className="fixed inset-0 bg-[#3B2820]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EADBCE] rounded-xl max-w-md w-full p-6 space-y-5 shadow-lg">
            <div>
              <h3 className="text-lg font-light text-[#3B2820]">
                Process Sale: {selectedProduct.name}
              </h3>
              <p className="text-xs text-[#8C6247] mt-0.5">
                Current Stock: {selectedProduct.stock} units | Price: ₹
                {selectedProduct.price}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#8C6247] font-normal">
                Quantity to Sell
              </label>
              <input
                type="number"
                min="1"
                max={selectedProduct.stock}
                value={sellQty}
                onChange={(e) => setSellQty(e.target.value)}
                className="w-full bg-[#FFFDF9] border border-[#EADBCE] text-[#3B2820] text-sm rounded-lg p-2.5 outline-none focus:border-[#C68A53]"
              />
            </div>

            <div className="p-3 bg-[#FDF9F3] rounded-lg border border-[#EADBCE] flex justify-between items-center text-xs text-[#3B2820]">
              <span>Total Price:</span>
              <span className="font-normal text-sm text-[#C68A53]">
                ₹{(selectedProduct.price * sellQty).toLocaleString()}
              </span>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 border border-[#D9C4B1] text-[#8C6247] text-xs rounded-lg hover:bg-[#FDF9F3]"
              >
                Cancel
              </button>
              <button
                disabled={sellingLoading}
                onClick={handleConfirmSale}
                className="px-4 py-2 bg-[#C68A53] text-white text-xs rounded-lg hover:bg-[#8C6247] disabled:opacity-50"
              >
                {sellingLoading ? "Processing..." : "Confirm Sale"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FranchiseInventory;