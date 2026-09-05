import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useFranchise } from "../hooks/useFranchise";

const FranchisePayoutRequest = () => {
  const { currentFranchise } = useFranchise();

  const [calculation, setCalculation] = useState(null);
  const [requestHistory, setRequestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [testMode, setTestMode] = useState(false); // Developer testing toggle if today is not the 5th

  const fetchPayoutCalculation = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("/api/franchise/financials/payout-calculation", {
        withCredentials: true
      });
      if (res.data?.success) {
        setCalculation(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching payout calculation:", err);
      setError(err.response?.data?.message || "Failed to load payout details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestHistory = async () => {
    try {
      const res = await axios.get("/api/franchise/financials/payout-requests", {
        withCredentials: true
      });
      if (res.data?.success) {
        setRequestHistory(res.data.requests || []);
      }
    } catch (err) {
      console.error("Error fetching payout request history:", err);
    }
  };

  useEffect(() => {
    fetchPayoutCalculation();
    fetchRequestHistory();
  }, []);

  const handleGeneratePayoutRequest = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      const res = await axios.post(
        `/api/franchise/financials/payout-request${testMode ? "?force=true" : ""}`,
        { force: testMode },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setSuccessMsg(res.data.message);
        fetchPayoutCalculation();
        fetchRequestHistory();
      }
    } catch (err) {
      console.error("Error generating payout request:", err);
      setError(err.response?.data?.message || "Failed to submit payout request.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  const todayDate = new Date().getDate();
  const isDate5 = todayDate === 5;
  const canSubmit = (isDate5 || testMode) && !calculation?.existingRequest;

  return (
    <div className="min-h-screen bg-stone-50 font-light text-slate-700 p-4 md:p-8">
      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto space-y-6">
        {/* Back to Dashboard Navigation Button */}
        <div>
          <Link
            to="/franchise/dashboard"
            className="inline-flex items-center gap-2 text-xs font-normal text-slate-500 hover:text-amber-600 bg-white border border-stone-200/80 px-3.5 py-2 rounded-xl shadow-2xs transition hover:bg-stone-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Franchise Dashboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-stone-200/80 shadow-sm gap-4">
          <div>
            <h1 className="text-xl font-light text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Monthly Payout Request
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Generate manual payout requests for your monthly ROI, Rent, and Commission benefits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-normal border ${
              isDate5 
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-amber-50 text-amber-800 border-amber-300"
            }`}>
              Today's Date: <strong>Day {todayDate}</strong> {isDate5 ? "✓ (Payout Day)" : "• Payouts open on 5th"}
            </span>

            {!isDate5 && (
              <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                <input
                  type="checkbox"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Testing Override</span>
              </label>
            )}
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="underline text-rose-900">Dismiss</button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex justify-between items-center">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="underline text-emerald-950">Dismiss</button>
          </div>
        )}

        {/* Date Restriction Alert Notice */}
        {!isDate5 && !testMode && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-normal">Payout Window Notice:</p>
              <p className="text-amber-800 mt-0.5">
                Payout requests are manually generated on the <strong>5th of every month</strong>. On other days, request generation is disabled. Enable "Testing Override" above to test request creation outside the 5th date window.
              </p>
            </div>
          </div>
        )}

        {/* Existing Pending/Submitted Request Banner */}
        {calculation?.existingRequest && (
          <div className="p-4 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between shadow-md">
            <div>
              <p className="text-amber-400 font-normal uppercase tracking-wider text-[10px]">Active Monthly Payout Request Status</p>
              <p className="text-sm font-light mt-1">
                Submitted for <strong>{calculation.existingRequest.month}/{calculation.existingRequest.year}</strong> • Total Amount: <strong>₹{calculation.existingRequest.totalAmount?.toLocaleString()}</strong>
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-normal uppercase ${
              calculation.existingRequest.status === "PENDING" 
                ? "bg-amber-500/20 text-amber-300 border border-amber-400/40 animate-pulse" 
                : calculation.existingRequest.status === "ACCEPTED" 
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                : "bg-rose-500/20 text-rose-300 border border-rose-400/40"
            }`}>
              {calculation.existingRequest.status}
            </span>
          </div>
        )}

        {/* Dynamic Monthly Payout Breakdown Cards */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading payout calculation...</div>
        ) : calculation ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* ROI Benefit */}
              <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-normal">Monthly ROI Benefit</span>
                  <h3 className="text-2xl font-light text-slate-800 mt-2">
                    {formatCurrency(calculation.roiAmount)}
                  </h3>
                </div>
                <p className="text-[11px] text-amber-600 mt-3">Fixed Tier Return</p>
              </div>

              {/* Rent Benefit */}
              <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-normal">Monthly Rent Benefit</span>
                  <h3 className="text-2xl font-light text-slate-800 mt-2">
                    {formatCurrency(calculation.rentAmount)}
                  </h3>
                </div>
                <p className="text-[11px] text-amber-600 mt-3">Outlet Rental Allowance</p>
              </div>

              {/* Commission Benefit */}
              <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-normal">Hierarchy & Product Commission</span>
                  <h3 className="text-2xl font-light text-slate-800 mt-2">
                    {formatCurrency(calculation.commissionAmount)}
                  </h3>
                </div>
                <p className="text-[11px] text-amber-600 mt-3 truncate">{calculation.details?.note || "Monthly Tier Commission"}</p>
              </div>

              {/* Total Payout */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-700 shadow-md flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-amber-400 font-normal">Total Monthly Payout</span>
                  <h3 className="text-3xl font-light text-white mt-2">
                    {formatCurrency(calculation.totalAmount)}
                  </h3>
                </div>

                <button
                  onClick={handleGeneratePayoutRequest}
                  disabled={!canSubmit || submitting}
                  className="mt-4 w-full text-xs font-normal py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 text-slate-950 transition-all shadow-md shadow-amber-500/20"
                >
                  {submitting ? "Submitting..." : calculation.existingRequest ? "Request Already Submitted" : "Submit Payout Request"}
                </button>
              </div>
            </div>

            {/* Detailed Calculation Note Card */}
            <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-sm space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-normal text-slate-700">Calculation Summary & Hierarchy Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-light text-slate-600">
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/60">
                  <span className="text-[10px] text-slate-400 uppercase">Tier Level</span>
                  <p className="font-normal text-slate-800 mt-0.5">{currentFranchise?.franchiseType} FRANCHISE</p>
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/60">
                  <span className="text-[10px] text-slate-400 uppercase">Subordinate Units Volume</span>
                  <p className="font-normal text-slate-800 mt-0.5">
                    {calculation.details?.underFranchiseCount || 0} Outlets • Sales: ₹{(calculation.details?.underFranchiseSales || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/60">
                  <span className="text-[10px] text-slate-400 uppercase">Product Sales Volume</span>
                  <p className="font-normal text-slate-800 mt-0.5">
                    {calculation.details?.productSalesCount || 0} Products Sold
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Payout Request History Table */}
        <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-normal text-slate-700">Payout Requests History</h2>
            <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
              {requestHistory.length} Total Requests
            </span>
          </div>

          {requestHistory.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No previous payout requests generated.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-light border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-slate-400 uppercase tracking-wider font-normal">
                    <th className="pb-3 pl-2">Period</th>
                    <th className="pb-3">ROI</th>
                    <th className="pb-3">Rent</th>
                    <th className="pb-3">Commission</th>
                    <th className="pb-3">Total Amount</th>
                    <th className="pb-3">Bank Reference (UTR)</th>
                    <th className="pb-3 text-right pr-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {requestHistory.map((req) => (
                    <tr key={req._id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3.5 pl-2 font-normal text-slate-800">
                        {req.month}/{req.year}
                      </td>
                      <td className="py-3.5 text-slate-600">₹{req.roiAmount?.toLocaleString()}</td>
                      <td className="py-3.5 text-slate-600">₹{req.rentAmount?.toLocaleString()}</td>
                      <td className="py-3.5 text-slate-600">₹{req.commissionAmount?.toLocaleString()}</td>
                      <td className="py-3.5 font-normal text-slate-900">₹{req.totalAmount?.toLocaleString()}</td>
                      <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                        {req.transactionRef || req.rejectionReason || "Awaiting Admin Processing"}
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-normal ${
                            req.status === "ACCEPTED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                              : req.status === "REJECTED"
                              ? "bg-rose-50 text-rose-700 border border-rose-300"
                              : "bg-amber-50 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FranchisePayoutRequest;
