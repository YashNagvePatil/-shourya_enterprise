import React, { useEffect, useState } from "react";
import { useFranchise } from "../hooks/useFranchise";
import { getInventory, sellFromInventory } from "../services/franchiseApi";

 const FranchiseInventory = () => {
  const { inventoryItems, handleSetInventory, handleRecordSale } = useFranchise();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantitySold, setQuantitySold] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInv = async () => {
      try {
        const res = await getInventory();
        if (res.success) handleSetInventory(res.inventory || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInv();
  }, []);

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setLoading(true);
    try {
      const res = await sellFromInventory({
        productId: selectedProduct._id,
        quantity: Number(quantitySold)
      });
      if (res.success) {
        handleRecordSale(selectedProduct._id, Number(quantitySold));
        setSelectedProduct(null);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-stone-50 min-h-screen font-light text-slate-700 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-stone-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-light text-slate-800">Franchise Stock & Inventory</h1>
          <p className="text-xs text-slate-400 mt-1">Direct stock monitoring and point-of-sale deduction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stock List */}
        <div className="md:col-span-2 bg-white rounded-xl border border-stone-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200/80 text-slate-400 uppercase tracking-wider font-normal">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {inventoryItems.length === 0 ? (
                <tr><td colSpan="3" className="p-4 text-center text-slate-400">No stock available</td></tr>
              ) : (
                inventoryItems.map((item) => (
                  <tr key={item._id} className="hover:bg-stone-50/50">
                    <td className="p-4 text-slate-800 font-normal">{item.name || item.productId}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${item.stock < 10 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>
                        {item.stock} Units
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedProduct(item)}
                        className="text-amber-600 font-normal hover:underline"
                      >
                        Record Direct Sale
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sell Drawer / Box */}
        <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-sm h-fit space-y-4">
          <h3 className="text-sm font-normal text-slate-800">Record Outlet Sale</h3>
          {selectedProduct ? (
            <form onSubmit={handleSaleSubmit} className="space-y-4">
              <div className="p-3 bg-stone-50 rounded border border-stone-200 text-xs">
                <p className="text-slate-400">Selected Product:</p>
                <p className="font-normal text-slate-700">{selectedProduct.name || selectedProduct._id}</p>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1">Quantity Sold</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.stock}
                  value={quantitySold}
                  onChange={(e) => setQuantitySold(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-slate-200 rounded text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-amber-500 text-white rounded text-xs font-normal hover:bg-amber-600 shadow-sm"
              >
                {loading ? "Processing..." : "Deduct Stock"}
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-400">Select a product from the inventory list to execute a direct sale.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FranchiseInventory