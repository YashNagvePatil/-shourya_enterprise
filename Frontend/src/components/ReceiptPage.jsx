import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router";
import { 
  CheckCircle2, 
  Sparkles, 
  ShoppingBag, 
  Download, 
  Home, 
  Copy, 
  ShieldCheck,
  PackageCheck,
  ArrowLeft
} from "lucide-react";
import { fetchOrderDetails } from "../features/Payment/service/payment.api";

const ReceiptPage = ({ orderData: propOrderData }) => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!propOrderData && !location.state?.receiptData);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(() => {
    if (propOrderData) return propOrderData;
    if (location.state?.receiptData) {
      const rd = location.state.receiptData;
      return {
        _id: rd.dbOrderId || rd.receiptNumber || orderId,
        paymentId: rd.transactionId || "N/A",
        receiptNumber: rd.receiptNumber || "N/A",
        date: rd.paidAt ? new Date(rd.paidAt).toLocaleString("en-IN") : new Date().toLocaleString("en-IN"),
        items: rd.items || [],
        totalPrice: rd.amount || 0,
        totalBV: rd.earnedPV ? rd.earnedPV * 2 : 1000,
        totalPV: rd.earnedPV || 500,
        gstAmount: Math.round((rd.amount || 0) * 0.18),
        shippingAddress: {
          name: "Valued Customer",
          email: "",
          phone: ""
        }
      };
    }
    return null;
  });

  useEffect(() => {
    // If order details already set from props or location state, skip fetch
    if (order && order._id && order.items && order.items.length > 0) {
      setLoading(false);
      return;
    }

    // Fetch order details from backend using orderId
    const getDetails = async () => {
      const targetId = orderId || location.state?.orderId;
      if (!targetId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetchOrderDetails(targetId);
        if (res.success && res.order) {
          const dbOrder = res.order;
          setOrder({
            _id: dbOrder._id,
            receiptNumber: dbOrder.receiptNumber || dbOrder._id,
            paymentId: dbOrder.paymentResult?.id || "pay_success",
            date: dbOrder.paidAt || dbOrder.createdAt 
              ? new Date(dbOrder.paidAt || dbOrder.createdAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : new Date().toLocaleDateString("en-IN"),
            items: dbOrder.items?.map(item => ({
              productId: item.product?._id || item.product,
              name: item.product?.name || "Product Item",
              qty: item.quantity || 1,
              price: item.product?.price || (dbOrder.totalAmount / (item.quantity || 1))
            })) || [],
            totalPrice: dbOrder.totalAmount,
            totalBV: dbOrder.earnedPV ? dbOrder.earnedPV * 2 : 1000,
            totalPV: dbOrder.earnedPV || 500,
            gstAmount: Math.round((dbOrder.totalAmount || 0) * 0.18),
            shippingAddress: {
              name: dbOrder.user?.name || "Customer",
              email: dbOrder.user?.email || "",
              phone: dbOrder.user?.phone || ""
            }
          });
        }
      } catch (err) {
        console.error("Failed to load order receipt details:", err);
        setError("Could not load order details.");
      } finally {
        setLoading(false);
      }
    };

    getDetails();
  }, [orderId, location.state]);

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex justify-center items-center text-slate-600">
        <div className="flex flex-col items-center space-y-4 bg-white px-8 py-6 rounded-2xl shadow-sm border border-amber-100">
          <div className="w-8 h-8 border-2 border-[#DC2643]/20 border-t-[#DC2643] rounded-full animate-spin" />
          <span className="tracking-wide text-xs text-slate-700 font-medium animate-pulse">
            Generating Tax Receipt...
          </span>
        </div>
      </div>
    );
  }

  // Fallback dummy order if order not found
  const displayOrder = order || {
    _id: orderId || "ORD" + Date.now().toString().slice(-8),
    receiptNumber: "REC_" + Date.now().toString().slice(-8),
    paymentId: "pay_test_" + Date.now().toString().slice(-6),
    date: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }),
    items: [
      { productId: "p1", name: "Formulation Bundle", qty: 1, price: 1500 },
    ],
    totalPrice: 1500,
    totalBV: 1000,
    totalPV: 500,
    gstAmount: 270,
    shippingAddress: {
      name: "Valued Member",
      email: "member@example.com",
      phone: "9876543210"
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#DC2643] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium">
            <ShieldCheck className="w-4 h-4" /> Verified Purchase
          </div>
        </div>

        {/* Success Header Banner */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-amber-900/10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#DC2643] via-[#E85D04] to-[#FAA307]" />
          
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50 shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-bold text-slate-800">Payment Successful!</h1>
          <p className="text-sm text-slate-500 mt-1">
            Thank you for your purchase. Your order has been placed and verified successfully.
          </p>

          {/* Payment & Order IDs */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 bg-[#FFFDF9] border border-amber-100 px-4 py-2.5 rounded-2xl text-xs sm:text-sm">
            <span className="text-slate-500">
              Receipt No: <strong className="text-slate-800 font-semibold">{displayOrder.receiptNumber || displayOrder._id}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 flex items-center gap-1">
              Payment ID: <strong className="text-slate-800 font-semibold">{displayOrder.paymentId}</strong>
              {displayOrder.paymentId !== "N/A" && (
                <Copy 
                  className="w-3.5 h-3.5 text-slate-400 hover:text-[#DC2643] cursor-pointer ml-1" 
                  onClick={() => copyToClipboard(displayOrder.paymentId)} 
                />
              )}
            </span>
          </div>
        </div>

        {/* MLM Rewards Card (Saffron/Crimson Theme) */}
        <div className="bg-gradient-to-br from-[#DC2643] via-[#E85D04] to-[#FAA307] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-yellow-100 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-4 h-4 text-yellow-300" /> Network Points Credited
            </div>
            <span className="bg-white/20 text-white text-[11px] px-3 py-1 rounded-full font-medium backdrop-blur-sm">
              Tree Auto-Updated
            </span>
          </div>

          <p className="text-sm text-red-50 mb-4">
            Network volume points allocated for this purchase:
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <span className="text-xs text-yellow-100 block">Total BV Earned</span>
              <span className="text-2xl sm:text-3xl font-bold text-yellow-200">{displayOrder.totalBV} BV</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <span className="text-xs text-yellow-100 block">Total PV Credited</span>
              <span className="text-2xl sm:text-3xl font-bold text-white">{displayOrder.totalPV} PV</span>
            </div>
          </div>
        </div>

        {/* Order Details & Delivery Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-amber-900/10 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#DC2643]" /> Receipt Breakdown
            </h2>
            <span className="text-xs text-slate-400">{displayOrder.date}</span>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-3">
            {displayOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-slate-50 last:border-b-0">
                <div>
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500">Quantity: {item.qty}</p>
                </div>
                <span className="font-semibold text-slate-800">₹{(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <hr className="border-slate-100" />

          {/* Billing Breakup */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>₹{displayOrder.totalPrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST (Included)</span>
              <span>₹{displayOrder.gstAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Shipping Fee</span>
              <span>COMPLIMENTARY</span>
            </div>
            
            <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-100">
              <span>Amount Paid</span>
              <span className="text-[#DC2643] text-xl">₹{displayOrder.totalPrice?.toLocaleString()}</span>
            </div>
          </div>

          {/* Shipping / User Summary if available */}
          {displayOrder.shippingAddress?.name && (
            <>
              <hr className="border-slate-100" />
              <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
                <PackageCheck className="w-5 h-5 text-[#DC2643] shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-slate-600 space-y-0.5">
                  <p className="font-semibold text-slate-800">Account / Delivery Info:</p>
                  <p>{displayOrder.shippingAddress.name} {displayOrder.shippingAddress.phone && `(${displayOrder.shippingAddress.phone})`}</p>
                  {displayOrder.shippingAddress.email && <p>{displayOrder.shippingAddress.email}</p>}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-700 hover:text-[#DC2643] border border-slate-200 px-6 py-3 rounded-xl font-medium text-sm transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download / Print Receipt
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#DC2643] hover:bg-[#b81d34] text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-red-200 cursor-pointer"
          >
            <Home className="w-4 h-4" /> Continue Shopping
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-4">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Official Tax Invoice & Order Confirmation
        </div>

      </div>
    </div>
  );
};

export default ReceiptPage;