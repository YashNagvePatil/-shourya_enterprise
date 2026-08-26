import React, { useState, useEffect } from "react";
import { useInventory } from "../hooks/useInventory"; 

const InventoryManager = ({ itemId }) => {
  const {
    selectedItem,
    loading,
    error,
    fetchInventoryItem,
    purchaseStock,
    deductStock,
    clearError,
  } = useInventory();

  // Active modal state: 'NONE' | 'PURCHASE' | 'DEDUCT'
  const [activeModal, setActiveModal] = useState("NONE");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [actionError, setActionError] = useState("");

  // Fetch inventory details on initial mount or ID change
  useEffect(() => {
    if (itemId) {
      fetchInventoryItem(itemId);
    }
  }, [itemId, fetchInventoryItem]);

  // Reset form inputs
  const resetForm = () => {
    setQuantity("");
    setPurchasePrice("");
    setSupplierName("");
    setActionError("");
  };

  // Handle Close Modal
  const closeModal = () => {
    setActiveModal("NONE");
    resetForm();
    clearError();
  };

  // Handle Stock Purchase (Add)
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setActionError("");

    if (!quantity || Number(quantity) <= 0) {
      setActionError("Please enter a valid positive quantity.");
      return;
    }

    try {
      await purchaseStock({
        itemId: selectedItem._id,
        quantity: Number(quantity),
        purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
        supplierName: supplierName || undefined,
      });
      closeModal();
    } catch (err) {
      setActionError(err?.message || "Failed to add stock");
    }
  };

  // Handle Stock Deduction (Sell)
  const handleDeductSubmit = async (e) => {
    e.preventDefault();
    setActionError("");

    if (!quantity || Number(quantity) <= 0) {
      setActionError("Please enter a valid positive quantity.");
      return;
    }

    if (Number(quantity) > selectedItem?.stockQuantity) {
      setActionError(`Cannot deduct more than current stock (${selectedItem?.stockQuantity}).`);
      return;
    }

    try {
      await deductStock({
        itemId: selectedItem._id,
        quantity: Number(quantity),
      });
      closeModal();
    } catch (err) {
      setActionError(err?.message || "Failed to deduct stock");
    }
  };

  // Stock Status Indicator Helper
  const getStockBadge = (qty) => {
    if (qty <= 0) {
      return (
        <span className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full">
          Out of Stock
        </span>
      );
    }
    if (qty < 10) {
      return (
        <span className="px-3 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
          Low Stock ({qty})
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
        In Stock ({qty})
      </span>
    );
  };

  if (loading && !selectedItem) {
    return (
      <div className="p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse">
        <div className="h-6 w-1/3 bg-slate-200 rounded mb-4"></div>
        <div className="h-4 w-1/2 bg-slate-100 rounded mb-8"></div>
        <div className="h-24 bg-slate-50 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto font-sans bg-slate-50 text-slate-800 min-h-screen">
      {/* Header Bar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-slate-900">
            Inventory Management
          </h1>
          <p className="text-sm text-slate-500 font-normal">
            Track and adjust item stock levels in real time
          </p>
        </div>
      </div>

      {/* Main Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex justify-between items-center text-sm text-red-700">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-800 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Item Details Card */}
      {selectedItem ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Item ID: {selectedItem._id}
              </span>
              <h2 className="text-xl font-medium text-slate-800 mt-1">
                {selectedItem.itemName || selectedItem.name || "Unnamed Product"}
              </h2>
            </div>
            {getStockBadge(selectedItem.stockQuantity ?? 0)}
          </div>

          <hr className="border-slate-100 my-4" />

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500 block mb-1">Current Stock</span>
              <span className="text-2xl font-light text-slate-900">
                {selectedItem.stockQuantity ?? 0} <span className="text-sm font-normal text-slate-500">units</span>
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500 block mb-1">SKU</span>
              <span className="text-base font-normal text-slate-800 font-mono">
                {selectedItem.sku || "N/A"}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 col-span-2 md:col-span-1">
              <span className="text-xs text-slate-500 block mb-1">Last Purchase Price</span>
              <span className="text-base font-medium text-slate-800">
                {selectedItem.lastPurchasePrice
                  ? `$${selectedItem.lastPurchasePrice}`
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setActiveModal("PURCHASE")}
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm shadow-sm disabled:opacity-50"
            >
              + Purchase / Add Stock
            </button>
            <button
              onClick={() => setActiveModal("DEDUCT")}
              disabled={loading || selectedItem.stockQuantity <= 0}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm shadow-sm disabled:opacity-50"
            >
              - Sell / Deduct Stock
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          No inventory item selected. Provide a valid Item ID.
        </div>
      )}

      {/* Modal Overlay */}
      {activeModal !== "NONE" && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              {activeModal === "PURCHASE" ? "Purchase / Restock Item" : "Deduct Stock / Record Sale"}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Item: <span className="font-medium text-slate-700">{selectedItem?.itemName}</span>
            </p>

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-xs">
                {actionError}
              </div>
            )}

            <form onSubmit={activeModal === "PURCHASE" ? handlePurchaseSubmit : handleDeductSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                {activeModal === "PURCHASE" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Purchase Price per Unit (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 25.50"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Supplier Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Wholesale Ltd."
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 text-xs font-medium text-white rounded-lg transition shadow-sm ${
                    activeModal === "PURCHASE"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-slate-900 hover:bg-slate-800"
                  }`}
                >
                  {loading ? "Processing..." : "Confirm Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager