import React, { useState, useEffect, useMemo } from "react";
import { useInventory } from "../hooks/useInventory";
import { Link } from "react-router-dom";

// ─── Color Palette (From Image) ──────────────────────────────────────────────
// 🔴 Crimson Red : #DC1F3C  → Primary accents, header banner, alert borders
// 🟠 Warm Orange : #F5A02A  → Action buttons, highlight pills, secondary accents
// 🟡 Muted Gold  : #D4B870  → Card borders, search borders, subtle dividers
// 🍦 Cream Ivory : #FFF8EC  → Main page background, card surfaces, table headers

const InventoryManager = ({ itemId }) => {
  const {
    items,
    selectedItem,
    loading,
    error,
    operationStatus,
    notFoundProductInfo,
    stockOperationSuccess,
    fetchAllInventoryItems,
    fetchInventoryItem,
    purchaseStock,
    deductStock,
    clearError,
    resetOperationStatus,
  } = useInventory();

  // Modal State
  const [activeModal, setActiveModal] = useState("NONE"); // 'NONE' | 'PURCHASE' | 'DEDUCT'
  const [targetProduct, setTargetProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [wholesalerPrice, setWholesalerPrice] = useState("");
  const [actionError, setActionError] = useState("");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL"); // 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'

  // Fetch all items on initial mount
  useEffect(() => {
    fetchAllInventoryItems();
  }, [fetchAllInventoryItems]);

  // Fetch specific item if itemId prop changes
  useEffect(() => {
    if (itemId) {
      fetchInventoryItem(itemId);
    }
  }, [itemId, fetchInventoryItem]);

  // Auto-dismiss success toast after 3s & refresh list
  useEffect(() => {
    if (stockOperationSuccess) {
      fetchAllInventoryItems();
      const timer = setTimeout(() => resetOperationStatus(), 3000);
      return () => clearTimeout(timer);
    }
  }, [stockOperationSuccess, resetOperationStatus, fetchAllInventoryItems]);

  const resetForm = () => {
    setQuantity("");
    setPurchasePrice("");
    setWholesalerPrice("");
    setActionError("");
    setTargetProduct(null);
  };

  const closeModal = () => {
    setActiveModal("NONE");
    resetForm();
    clearError();
  };

  const openModal = (type, product) => {
    setTargetProduct(product);
    if (type === "PURCHASE") {
      setPurchasePrice(product?.price || product?.costPrice || "");
      setWholesalerPrice(product?.wholesalerPrice || product?.price || "");
    }
    setActiveModal(type);
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setActionError("");
    const prodId = targetProduct?.productId || targetProduct?._id;
    if (!prodId || !quantity || Number(quantity) <= 0) {
      setActionError("Please enter a valid positive quantity.");
      return;
    }
    try {
      await purchaseStock({
        itemId: prodId,
        quantity: Number(quantity),
        purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
        wholesalerPrice: wholesalerPrice ? Number(wholesalerPrice) : undefined,
      });
      closeModal();
    } catch (err) {
      setActionError(err?.message || "Failed to add stock");
    }
  };

  const handleDeductSubmit = async (e) => {
    e.preventDefault();
    setActionError("");
    const prodId = targetProduct?.productId || targetProduct?._id;
    const availableQty = targetProduct?.quantity ?? targetProduct?.stockQuantity ?? 0;

    if (!prodId || !quantity || Number(quantity) <= 0) {
      setActionError("Please enter a valid positive quantity.");
      return;
    }
    if (Number(quantity) > availableQty) {
      setActionError(`Cannot deduct more than available stock (${availableQty} units).`);
      return;
    }
    try {
      await deductStock({
        itemId: prodId,
        quantity: Number(quantity),
      });
      closeModal();
    } catch (err) {
      setActionError(err?.message || "Failed to deduct stock");
    }
  };

  // Filtered List Computation
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const name = item?.name || item?.itemName || "";
      const sku = item?.sku || "";
      const category = item?.category || "";
      const qty = item?.quantity ?? item?.stockQuantity ?? 0;

      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "ALL" || category.toUpperCase() === selectedCategory.toUpperCase();

      let matchesStock = true;
      if (stockFilter === "IN_STOCK") matchesStock = qty >= 10;
      if (stockFilter === "LOW_STOCK") matchesStock = qty > 0 && qty < 10;
      if (stockFilter === "OUT_OF_STOCK") matchesStock = qty <= 0;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [items, searchTerm, selectedCategory, stockFilter]);

  // Categories list extraction
  const categories = useMemo(() => {
    const set = new Set();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  // Metric Summaries
  const metrics = useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    items.forEach((item) => {
      const qty = item?.quantity ?? item?.stockQuantity ?? 0;
      if (qty >= 10) inStock++;
      else if (qty > 0) lowStock++;
      else outOfStock++;
    });
    return { total: items.length, inStock, lowStock, outOfStock };
  }, [items]);

  // Stock Badge Helper
  const getStockBadge = (qty) => {
    if (qty <= 0) {
      return (
        <span
          style={{ background: "#FEE2E2", color: "#DC1F3C", border: "1px solid #FCA5A5" }}
          className="px-3 py-1 text-xs font-light tracking-wide rounded-full flex items-center gap-1.5 w-max"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
          Out of Stock
        </span>
      );
    }
    if (qty < 10) {
      return (
        <span
          style={{ background: "#FEF3C7", color: "#B45309", border: "1px solid #D4B870" }}
          className="px-3 py-1 text-xs font-light tracking-wide rounded-full flex items-center gap-1.5 w-max"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Low Stock ({qty})
        </span>
      );
    }
    return (
      <span
        style={{ background: "#DCFCE7", color: "#15803D", border: "1px solid #86EFAC" }}
        className="px-3 py-1 text-xs font-light tracking-wide rounded-full flex items-center gap-1.5 w-max"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        In Stock ({qty})
      </span>
    );
  };

  return (
    <div
      style={{ background: "#FFF8EC", fontFamily: "'Inter', sans-serif" }}
      className="min-h-screen w-full text-slate-800 p-4 md:p-8 transition-all duration-300 font-light"
    >
      
      {/* ── Floating Toast Notification ──────────────────────────────────────── */}
      {stockOperationSuccess && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 9999,
            background: "linear-gradient(135deg, #DC1F3C, #F5A02A)",
            color: "#fff",
            borderRadius: "14px",
            padding: "14px 20px",
            boxShadow: "0 10px 30px rgba(220,31,60,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            animation: "slideIn 0.3s ease",
          }}
        >
          <span className="text-xl">
            {operationStatus === "purchase_success" ? "📦" : "✨"}
          </span>
          <div>
            <div className="font-normal text-sm tracking-wide">
              {operationStatus === "purchase_success" ? "Stock Added!" : "Stock Deducted!"}
            </div>
            <div className="text-xs opacity-90 font-light">
              {operationStatus === "purchase_success"
                ? "Warehouse inventory updated successfully."
                : "Sale recorded successfully."}
            </div>
          </div>
          <button
            onClick={resetOperationStatus}
            style={{
              marginLeft: "12px",
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "#fff",
              borderRadius: "6px",
              padding: "2px 8px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div
        style={{ borderBottom: "2px solid #D4B870", paddingBottom: "20px", marginBottom: "28px" }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div
            style={{
              background: "linear-gradient(135deg, #DC1F3C, #F5A02A)",
              boxShadow: "0 6px 18px rgba(220,31,60,0.25)",
            }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl text-white"
          >
            📦
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight text-slate-900 flex items-center gap-3">
              Inventory Management
              <span
                style={{ background: "#FEF3C7", color: "#B45309", border: "1px solid #D4B870" }}
                className="text-xs font-light px-3 py-0.5 rounded-full"
              >
                Live Sync
              </span>
            </h1>
            <p className="text-xs text-amber-900/70 font-light mt-0.5 tracking-wide">
              Real-time product stock level tracking & warehouse restock management
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/dashboard"
            style={{ background: "#fff", border: "1px solid #DC1F3C", color: "#DC1F3C" }}
            className="px-4 py-2 rounded-xl hover:bg-rose-50 text-xs font-light transition flex items-center gap-1.5 shadow-sm"
          >
            ← Back to Dashboard
          </Link>

          <button
            onClick={() => fetchAllInventoryItems()}
            disabled={loading}
            style={{ background: "#fff", border: "1px solid #D4B870", color: "#4B3621" }}
            className="px-4 py-2 rounded-xl hover:bg-amber-50/50 text-xs font-light transition flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <span className={loading ? "animate-spin" : ""}>🔄</span> Refresh List
          </button>

          <Link
            to="/admin/createProduct"
            style={{
              background: "linear-gradient(135deg, #DC1F3C, #F5A02A)",
              boxShadow: "0 4px 14px rgba(220,31,60,0.3)",
            }}
            className="px-5 py-2 rounded-xl text-white font-light text-xs transition flex items-center gap-2 hover:opacity-95"
          >
            <span>+</span> Create Product
          </Link>
        </div>
      </div>

      {/* ── Global Error Alert ────────────────────────────────────────────── */}
      {error && (
        <div
          style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", borderLeft: "4px solid #DC1F3C" }}
          className="mb-6 p-4 rounded-xl text-rose-800 flex justify-between items-center text-xs font-light shadow-sm"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-rose-700 hover:text-rose-950 font-normal px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Key Metrics Overview Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Catalog Products", value: metrics.total, icon: "🛍️", desc: "Items in System", accent: "#DC1F3C" },
          { label: "In Stock Items", value: metrics.inStock, icon: "✅", desc: "Healthy Stock (≥10)", accent: "#15803D" },
          { label: "Low Stock Warning", value: metrics.lowStock, icon: "⚠️", desc: "Needs Restock (<10)", accent: "#F5A02A" },
          { label: "Out of Stock", value: metrics.outOfStock, icon: "🚫", desc: "0 Units Remaining", accent: "#DC1F3C" },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              background: "#fff",
              border: "1px solid #E8D5B0",
              borderTop: `3px solid ${m.accent}`,
              boxShadow: "0 2px 10px rgba(212,184,112,0.1)",
            }}
            className="rounded-2xl p-5"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-light uppercase tracking-wider mb-2">
              <span>{m.label}</span>
              <span className="text-base">{m.icon}</span>
            </div>
            <div className="text-3xl font-light text-slate-900">{m.value}</div>
            <div className="text-xs text-amber-900/60 font-light mt-1">{m.desc}</div>
          </div>
        ))}
      </div>

      {/* ── Search & Filter Controls ────────────────────────────────────────── */}
      <div
        style={{ background: "#fff", border: "1px solid #E8D5B0", boxShadow: "0 2px 10px rgba(212,184,112,0.08)" }}
        className="rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: "#FFF8EC", border: "1px solid #D4B870" }}
            className="w-full text-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-light focus:outline-none focus:border-rose-500 placeholder:text-slate-400 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ background: "#FFF8EC", border: "1px solid #D4B870" }}
            className="text-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-light focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Stock Filter Pills */}
          <div
            style={{ background: "#FFF8EC", border: "1px solid #D4B870" }}
            className="flex p-1 rounded-xl text-xs font-light"
          >
            {[
              { id: "ALL", label: "All" },
              { id: "IN_STOCK", label: "In Stock" },
              { id: "LOW_STOCK", label: "Low" },
              { id: "OUT_OF_STOCK", label: "Out" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStockFilter(f.id)}
                style={{
                  background: stockFilter === f.id ? "linear-gradient(135deg, #DC1F3C, #F5A02A)" : "transparent",
                  color: stockFilter === f.id ? "#fff" : "#78350F",
                }}
                className="px-3 py-1.5 rounded-lg transition font-light"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Inventory Table ────────────────────────────────────────────── */}
      <div
        style={{ background: "#fff", border: "1px solid #E8D5B0", boxShadow: "0 4px 20px rgba(212,184,112,0.12)" }}
        className="rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                style={{ background: "#FFF8EC", borderBottom: "2px solid #D4B870" }}
                className="text-slate-600 text-xs font-normal uppercase tracking-wider"
              >
                <th className="py-4 px-6 font-normal">Product Details</th>
                <th className="py-4 px-4 font-normal">SKU & Category</th>
                <th className="py-4 px-4 font-normal">Price (DP / MRP)</th>
                <th className="py-4 px-4 font-normal">Current Stock</th>
                <th className="py-4 px-6 text-right font-normal">Inventory Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 text-xs font-light">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin text-xl mb-2">⏳</div>
                    <div>Loading inventory details...</div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-400">
                    <div className="text-3xl mb-2">🔍</div>
                    <div className="text-sm font-normal text-slate-700">No inventory products found</div>
                    <div className="text-xs text-slate-400 mt-1">Try refining your search terms or filters.</div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const qty = item?.quantity ?? item?.stockQuantity ?? 0;
                  const itemImg = item?.image || item?.images?.[0]?.url || item?.images?.[0];

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-amber-50/40 transition group"
                    >
                      {/* Product Details */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div
                            style={{ background: "#FFF8EC", border: "1px solid #E8D5B0" }}
                            className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-lg"
                          >
                            {itemImg ? (
                              <img src={itemImg} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              "🛍️"
                            )}
                          </div>
                          <div>
                            <div className="font-normal text-slate-900 text-sm group-hover:text-rose-700 transition">
                              {item.name || item.itemName || "Unnamed Product"}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono font-light">
                              ID: {item.productId || item._id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU & Category */}
                      <td className="py-4 px-4">
                        <div
                          style={{ background: "#FFF8EC", border: "1px solid #D4B870", color: "#78350F" }}
                          className="font-mono text-[11px] font-light px-2.5 py-0.5 rounded w-max mb-1"
                        >
                          {item.sku || "N/A"}
                        </div>
                        <div className="text-slate-500 font-light text-[11px]">{item.category || "General"}</div>
                      </td>

                      {/* Pricing */}
                      <td className="py-4 px-4">
                        <div className="font-normal text-slate-800 text-sm">
                          ₹{item.price || item.costPrice || 0}
                        </div>
                        {item.mrp && item.mrp > (item.price || 0) && (
                          <div className="text-[11px] text-slate-400 line-through font-light">
                            MRP: ₹{item.mrp}
                          </div>
                        )}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-4 px-4">
                        {getStockBadge(qty)}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal("PURCHASE", item)}
                            style={{
                              background: "linear-gradient(135deg, #F5A02A, #DC1F3C)",
                              boxShadow: "0 2px 8px rgba(245,160,42,0.25)",
                            }}
                            className="px-3.5 py-1.5 rounded-lg text-white font-light text-xs transition hover:opacity-90 flex items-center gap-1"
                          >
                            <span>📥</span> + Purchase
                          </button>

                          <button
                            onClick={() => openModal("DEDUCT", item)}
                            disabled={qty <= 0}
                            style={{
                              background: qty <= 0 ? "#F3F4F6" : "#fff",
                              border: qty <= 0 ? "1px solid #E5E7EB" : "1px solid #DC1F3C",
                              color: qty <= 0 ? "#9CA3AF" : "#DC1F3C",
                            }}
                            className="px-3.5 py-1.5 rounded-lg font-light text-xs transition disabled:opacity-40 flex items-center gap-1 hover:bg-rose-50"
                          >
                            <span>📤</span> - Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Action Modals ─────────────────────────────────────────────────── */}
      {activeModal !== "NONE" && targetProduct && (
        <div
          style={{ background: "rgba(26,26,26,0.5)", backdropFilter: "blur(4px)" }}
          className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn"
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #E8D5B0",
              boxShadow: "0 20px 50px rgba(220,31,60,0.18)",
            }}
            className="rounded-2xl max-w-md w-full overflow-hidden text-slate-800"
          >
            {/* Modal Header */}
            <div
              style={{
                background:
                  activeModal === "PURCHASE"
                    ? "linear-gradient(135deg, #F5A02A, #DC1F3C)"
                    : "linear-gradient(135deg, #1A1A1A, #DC1F3C)",
              }}
              className="p-5 text-white"
            >
              <h3 className="text-base font-normal flex items-center gap-2 tracking-wide">
                <span>{activeModal === "PURCHASE" ? "📥 Purchase / Restock Item" : "📤 Sell / Deduct Stock"}</span>
              </h3>
              <p className="text-xs font-light text-white/85 mt-0.5">
                {targetProduct.name || targetProduct.itemName} (SKU: {targetProduct.sku})
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 font-light">
              {actionError && (
                <div
                  style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#DC1F3C" }}
                  className="mb-4 p-3 rounded-lg text-xs font-normal"
                >
                  ⚠️ {actionError}
                </div>
              )}

              <form onSubmit={activeModal === "PURCHASE" ? handlePurchaseSubmit : handleDeductSubmit}>
                <div className="space-y-4">
                  {/* Quantity Input */}
                  <div>
                    <label className="block text-xs font-normal text-slate-700 uppercase tracking-wider mb-1">
                      Quantity <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 10"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      style={{ background: "#FFF8EC", border: "1px solid #D4B870" }}
                      className="w-full rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500 font-light"
                    />
                    <span className="text-[11px] text-amber-900/60 font-light mt-1 block">
                      Current Stock: {targetProduct.quantity ?? targetProduct.stockQuantity ?? 0} units
                    </span>
                  </div>

                  {/* Purchase-only fields */}
                  {activeModal === "PURCHASE" && (
                    <>
                      <div>
                        <label className="block text-xs font-normal text-slate-700 uppercase tracking-wider mb-1">
                          Cost Price per Unit <span className="text-slate-400 font-light">(Optional)</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="e.g. 250"
                          value={purchasePrice}
                          onChange={(e) => setPurchasePrice(e.target.value)}
                          style={{ background: "#FFF8EC", border: "1px solid #D4B870" }}
                          className="w-full rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500 font-light"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-normal text-slate-700 uppercase tracking-wider mb-1">
                          Wholesaler Price per Unit <span className="text-slate-400 font-light">(Optional)</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="e.g. 300"
                          value={wholesalerPrice}
                          onChange={(e) => setWholesalerPrice(e.target.value)}
                          style={{ background: "#FFF8EC", border: "1px solid #D4B870" }}
                          className="w-full rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500 font-light"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-2.5 justify-end mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    style={{ background: "#FFF8EC", border: "1px solid #D4B870", color: "#4B3621" }}
                    className="px-4 py-2 rounded-xl text-xs font-light hover:bg-amber-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      background:
                        activeModal === "PURCHASE"
                          ? "linear-gradient(135deg, #F5A02A, #DC1F3C)"
                          : "linear-gradient(135deg, #1A1A1A, #DC1F3C)",
                      boxShadow: "0 4px 14px rgba(220,31,60,0.25)",
                    }}
                    className="px-5 py-2 rounded-xl text-xs font-light text-white disabled:opacity-50"
                  >
                    {loading ? "⏳ Processing..." : activeModal === "PURCHASE" ? "✅ Confirm Purchase" : "✅ Confirm Deduction"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(60px); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default InventoryManager;