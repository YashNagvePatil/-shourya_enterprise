import React, { useState } from "react";
import { useNavigate } from "react-router";
import { 
  ShieldCheck, 
  CreditCard, 
  Sparkles, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowLeft,
  Lock,
  Wallet,
  Building2
} from "lucide-react";
import { usePayment } from "../hook/usePayment"; // Check hook path

const PaymentPage = ({ orderData }) => {
  const navigate = useNavigate();
  const { executePayment, loading, error } = usePayment();
  const [selectedMethod, setSelectedMethod] = useState("card");

  // Dummy order fallback agar props na milein
  const order = orderData || {
    _id: "ORD67890123",
    items: [
      { productId: "65f1a2b3c4d5e6f7a8b9c0d1", name: "Executive Health Bundle", qty: 1, price: 2499 },
      { productId: "65f1a2b3c4d5e6f7a8b9c0d2", name: "Wellness Booster Pack", qty: 2, price: 999 },
    ],
    totalPrice: 4497,
    totalBV: 1500, // Business Volume
    totalPV: 120,  // Point Value
    gstAmount: 809,
    shippingAddress: {
      name: "Rahul Sharma",
      email: "rahul@example.com",
      city: "Mumbai",
      pincode: "400001",
      phone: "9876543210"
    }
  };

  const handlePayment = async () => {
    // Naye executePayment setup ke hisaab se payload
    const cartPayload = {
      productId: order.items[0]?.productId || order._id,
      quantity: order.items[0]?.qty || 1,
      amount: order.totalPrice,
    };

    const userDetails = {
      name: order.shippingAddress.name,
      email: order.shippingAddress.email || "user@example.com",
      phone: order.shippingAddress.phone,
    };

    const result = await executePayment(cartPayload, userDetails);
    
    if (result.success) {
      // Success hone par receipt/confirmation page par redirect karein
      const orderId = result.data?.dbOrderId || result.data?.receiptData?.dbOrderId || order._id;
      navigate(`/receipt/${orderId}`, {
        state: {
          receiptData: result.data?.receiptData,
          paymentData: result.data,
        },
        replace: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#DC2643] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </button>
          <div className="flex items-center gap-2 text-[#DC2643] bg-red-50 border border-red-200 px-3 py-1.5 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" /> 256-Bit SSL Encrypted
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Shipping Info & Payment Methods */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Delivery Details Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-900/10">
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center justify-between">
                Shipping Details
                <span className="text-xs text-[#DC2643] font-normal hover:underline cursor-pointer">Edit</span>
              </h2>
              <div className="text-sm text-slate-600 space-y-1 bg-[#FFFDF9] p-4 rounded-xl border border-amber-100">
                <p className="font-semibold text-slate-800">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.city} - {order.shippingAddress.pincode}</p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-900/10">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Select Payment Method</h2>
              
              <div className="space-y-3">
                {/* Credit / Debit Card */}
                <label 
                  onClick={() => setSelectedMethod("card")}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedMethod === "card" 
                      ? "border-[#DC2643] bg-red-50/40 ring-1 ring-[#DC2643]" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red-100 text-[#DC2643] rounded-lg">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Credit / Debit Card</p>
                      <p className="text-xs text-slate-500">Visa, Mastercard, RuPay</p>
                    </div>
                  </div>
                  <input type="radio" checked={selectedMethod === "card"} readOnly className="accent-[#DC2643]" />
                </label>

                {/* UPI Option */}
                <label 
                  onClick={() => setSelectedMethod("upi")}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedMethod === "upi" 
                      ? "border-[#DC2643] bg-red-50/40 ring-1 ring-[#DC2643]" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-100 text-amber-600 rounded-lg">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Instant UPI Payment</p>
                      <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm</p>
                    </div>
                  </div>
                  <input type="radio" checked={selectedMethod === "upi"} readOnly className="accent-[#DC2643]" />
                </label>

                {/* Netbanking Option */}
                <label 
                  onClick={() => setSelectedMethod("netbanking")}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedMethod === "netbanking" 
                      ? "border-[#DC2643] bg-red-50/40 ring-1 ring-[#DC2643]" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-yellow-100 text-yellow-700 rounded-lg">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Net Banking</p>
                      <p className="text-xs text-slate-500">All major Indian banks supported</p>
                    </div>
                  </div>
                  <input type="radio" checked={selectedMethod === "netbanking"} readOnly className="accent-[#DC2643]" />
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: MLM Points & Summary */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* MLM Rewards Card (Styled with Saffron/Crimson Theme) */}
            <div className="bg-gradient-to-br from-[#DC2643] via-[#E85D04] to-[#FAA307] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-2 text-yellow-100 text-xs font-semibold tracking-wider uppercase mb-2">
                <Sparkles className="w-4 h-4 text-yellow-300" /> Distributor Rewards
              </div>
              
              <p className="text-sm text-red-50 mb-4">
                Points generated on this order for network propagation:
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/15 backdrop-blur-md p-3 rounded-xl border border-white/20">
                  <span className="text-xs text-yellow-100 block">Total BV Points</span>
                  <span className="text-2xl font-bold text-yellow-200">{order.totalBV} BV</span>
                </div>
                <div className="bg-white/15 backdrop-blur-md p-3 rounded-xl border border-white/20">
                  <span className="text-xs text-yellow-100 block">Total PV Points</span>
                  <span className="text-2xl font-bold text-white">{order.totalPV} PV</span>
                </div>
              </div>
            </div>

            {/* Order Price Breakdown */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-900/10 space-y-4">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#DC2643]" /> Order Summary
              </h3>

              {/* Item List */}
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.name} × {item.qty}</span>
                    <span className="font-semibold text-slate-800">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              <hr className="border-slate-100" />

              {/* Price Calculation */}
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
                  <span>Delivery Charges</span>
                  <span>FREE</span>
                </div>
                
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total Payable</span>
                  <span className="text-[#DC2643] text-xl">₹{order.totalPrice}</span>
                </div>
              </div>

              {/* Error Message Display */}
              {error && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-[#DC2643] hover:bg-[#b81d34] active:bg-[#99152a] text-white font-semibold py-3.5 px-4 rounded-xl shadow-md shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{order.totalPrice} Securely</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Guaranteed Safe Checkout
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default PaymentPage;