import React from "react";
import { 
  CheckCircle2, 
  Sparkles, 
  ShoppingBag, 
  Download, 
  Home, 
  Share2, 
  Copy, 
  ShieldCheck,
  PackageCheck
} from "lucide-react";

const ReceiptPage = ({ orderData }) => {
  // Dummy order data agar props se na mile
  const order = orderData || {
    _id: "ORD67890123",
    paymentId: "pay_Px9Z81kLm230",
    date: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }),
    items: [
      { productId: "65f1a2b3c4d5e6f7a8b9c0d1", name: "Executive Health Bundle", qty: 1, price: 2499 },
      { productId: "65f1a2b3c4d5e6f7a8b9c0d2", name: "Wellness Booster Pack", qty: 2, price: 999 },
    ],
    totalPrice: 4497,
    totalBV: 1500,
    totalPV: 120,
    gstAmount: 809,
    shippingAddress: {
      name: "Rahul Sharma",
      email: "rahul@example.com",
      city: "Mumbai",
      pincode: "400001",
      phone: "9876543210"
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Success Header Banner */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-amber-900/10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#DC2643] via-[#E85D04] to-[#FAA307]" />
          
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-bold text-slate-800">Payment Successful!</h1>
          <p className="text-sm text-slate-500 mt-1">
            Thank you for your purchase. Your order has been placed successfully.
          </p>

          {/* Payment & Order IDs */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 bg-[#FFFDF9] border border-amber-100 px-4 py-2.5 rounded-2xl text-xs sm:text-sm">
            <span className="text-slate-500">
              Order ID: <strong className="text-slate-800 font-semibold">{order._id}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 flex items-center gap-1">
              Payment ID: <strong className="text-slate-800 font-semibold">{order.paymentId}</strong>
              <Copy 
                className="w-3.5 h-3.5 text-slate-400 hover:text-[#DC2643] cursor-pointer ml-1" 
                onClick={() => copyToClipboard(order.paymentId)} 
              />
            </span>
          </div>
        </div>

        {/* MLM Rewards Card (Saffron/Crimson Theme) */}
        <div className="bg-gradient-to-br from-[#DC2643] via-[#E85D04] to-[#FAA307] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-yellow-100 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-4 h-4 text-yellow-300" /> Distributor Network Status
            </div>
            <span className="bg-white/20 text-white text-[11px] px-3 py-1 rounded-full font-medium backdrop-blur-sm">
              Points Distributed
            </span>
          </div>

          <p className="text-sm text-red-50 mb-4">
            Points updated in network tree & credited to sponsor chain:
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <span className="text-xs text-yellow-100 block">Total BV Earned</span>
              <span className="text-2xl sm:text-3xl font-bold text-yellow-200">{order.totalBV} BV</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <span className="text-xs text-yellow-100 block">Total PV Credited</span>
              <span className="text-2xl sm:text-3xl font-bold text-white">{order.totalPV} PV</span>
            </div>
          </div>
        </div>

        {/* Order Details & Delivery Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-amber-900/10 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#DC2643]" /> Receipt Summary
            </h2>
            <span className="text-xs text-slate-400">{order.date}</span>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500">Qty: {item.qty}</p>
                </div>
                <span className="font-semibold text-slate-800">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>

          <hr className="border-slate-100" />

          {/* Billing Breakup */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>₹{order.totalPrice}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST (Included)</span>
              <span>₹{order.gstAmount}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Shipping Fee</span>
              <span>FREE</span>
            </div>
            
            <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-100">
              <span>Amount Paid</span>
              <span className="text-[#DC2643] text-xl">₹{order.totalPrice}</span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Shipping Address Summary */}
          <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
            <PackageCheck className="w-5 h-5 text-[#DC2643] shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-600 space-y-0.5">
              <p className="font-semibold text-slate-800">Deliver To:</p>
              <p>{order.shippingAddress.name} ({order.shippingAddress.phone})</p>
              <p>{order.shippingAddress.city} - {order.shippingAddress.pincode}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-700 hover:text-[#DC2643] border border-slate-200 px-6 py-3 rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Receipt
          </button>

          <button
            onClick={() => window.location.href = "/"}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#DC2643] hover:bg-[#b81d34] text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-red-200"
          >
            <Home className="w-4 h-4" /> Go to Dashboard
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