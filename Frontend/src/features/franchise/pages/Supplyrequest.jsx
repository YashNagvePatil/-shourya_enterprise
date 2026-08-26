import React, { useEffect, useState } from "react";
import { useFranchise } from "../hooks/useFranchise";
import { getSupplyRequestsForHierarchy, createSupplyRequest } from "../services/franchiseApi";

 const Supply = () => {
  const { supplyRequests, handleSetSupplyRequests, handleAddSupplyRequest } = useFranchise();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await getSupplyRequestsForHierarchy();
        if (res.success) handleSetSupplyRequests(res.requests || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRequests();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createSupplyRequest({ items: [{ productId, quantity: Number(quantity) }] });
      if (res.success) {
        handleAddSupplyRequest(res.supplyRequest);
        setShowModal(false);
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
          <h1 className="text-xl font-light text-slate-800">Hierarchy Supply Requests</h1>
          <p className="text-xs text-slate-400 mt-1">Manage product orders flowing from parent nodes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded text-xs font-normal shadow-sm hover:from-amber-600"
        >
          + New Request
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 border-b border-stone-200/80 text-slate-400 uppercase tracking-wider font-normal">
            <tr>
              <th className="p-4">Request ID</th>
              <th className="p-4">Items Count</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {supplyRequests.length === 0 ? (
              <tr><td colSpan="4" className="p-4 text-center text-slate-400">No supply requests found</td></tr>
            ) : (
              supplyRequests.map((req) => (
                <tr key={req._id} className="hover:bg-stone-50/50">
                  <td className="p-4 text-slate-800 font-normal">{req._id}</td>
                  <td className="p-4">{req.items?.length || 0} Products</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px]">
                      {req.status || "Pending"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4 border border-stone-200">
            <h3 className="text-base font-light text-slate-800">Create Supply Request</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Product ID"
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-slate-200 rounded text-xs"
              />
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-slate-200 rounded text-xs"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs text-slate-500">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-1.5 bg-amber-500 text-white rounded text-xs">
                  {loading ? "Sending..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export  default Supply