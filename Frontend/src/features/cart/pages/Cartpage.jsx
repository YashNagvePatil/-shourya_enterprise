import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useCart } from "../hook/usecart";
import { getImageUrl } from "../../products/hook/useGetProduct";
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Zap } from "lucide-react";

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, isLoading, error, fetchCart, addToCart, removeFromCart } = useCart();

  const fallbackImage =
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800";

  // Fetch cart on initial mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Handle Quantity Increase
  const handleIncrease = async (productId) => {
    await addToCart(productId, 1);
  };

  // Handle Quantity Decrease
  const handleDecrease = async (productId, currentQty) => {
    if (currentQty > 1) {
      await addToCart(productId, -1);
    } else {
      await removeFromCart(productId);
    }
  };

  // 1. Loading State
  if (isLoading && (!cart?.items || cart.items.length === 0)) {
    return (
      <div className="min-h-screen bg-[#FAF5EE] flex justify-center items-center text-slate-500 font-light">
        <div className="flex flex-col items-center space-y-4 bg-white px-8 py-6 rounded-2xl shadow-xs border border-[#E0C475]/40">
          <div className="w-8 h-8 border-2 border-[#DC2643]/20 border-t-[#DC2643] rounded-full animate-spin" />
          <span className="tracking-wide text-xs font-light text-slate-700 animate-pulse">
            Retrieving Cart...
          </span>
        </div>
      </div>
    );
  }

  // 2. Empty Cart State
  if (!isLoading && (!cart?.items || cart.items.length === 0)) {
    return (
      <div className="min-h-screen bg-[#FAF5EE] text-slate-800 font-light flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md bg-white p-8 rounded-2xl border border-[#E0C475]/40 shadow-xs">
          <div className="w-16 h-16 border border-[#E0C475]/40 rounded-2xl flex items-center justify-center mx-auto bg-[#FAF5EE] text-[#DC2643]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-light text-slate-900 tracking-tight">
              Your Cart is Empty
            </h2>
            <p className="text-slate-500 text-xs font-light leading-relaxed">
              Looks like you haven't added any formulations to your cart yet.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-[#DC2643] hover:bg-[#c41e38] text-white text-xs font-light rounded-xl shadow-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF5EE] text-slate-800 font-light pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-light text-slate-500 mb-6">
          <Link to="/" className="hover:text-[#DC2643] transition">
            Catalog
          </Link>
          <span className="text-[#E0C475]">/</span>
          <span className="text-slate-800">Cart</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-baseline justify-between border-b border-[#E0C475]/40 pb-5 mb-8">
          <h1 className="text-xl sm:text-2xl font-light tracking-tight text-slate-900">
            Your <span className="text-[#DC2643]">Selections</span>
          </h1>
          <span className="text-xs text-slate-500 font-light">
            {cart?.items?.length} {cart?.items?.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-[#DC2643]/10 border border-[#DC2643]/30 text-[#DC2643] text-xs font-light rounded-xl">
            {error}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.items.map((item) => {
              const product = item.product || {};
              const imgUrl = getImageUrl(product.images?.[0]) || fallbackImage;

              return (
                <div
                  key={item._id || product._id}
                  className="bg-white border border-[#E0C475]/40 hover:border-[#DC2643]/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-5 transition-all shadow-xs"
                >
                  {/* Product Details & Image */}
                  <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <div className="w-20 h-20 sm:w-22 sm:h-22 bg-[#FAF5EE] border border-[#E0C475]/30 rounded-xl overflow-hidden flex-none">
                      <img
                        src={imgUrl}
                        alt={product.name || "Product"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[10px] font-light text-[#F59E35] tracking-wider uppercase">
                        {product.brand || "GENERIC"}
                      </span>
                      <h3 className="text-xs sm:text-sm font-light text-slate-900 line-clamp-1">
                        {product.name || "Product Name"}
                      </h3>
                      
                      <div className="flex items-center space-x-2.5 pt-0.5">
                        <span className="text-sm font-light text-slate-900">
                          ₹{item.price?.toLocaleString()}
                        </span>
                        {item.pv > 0 && (
                          <span className="bg-[#FAF5EE] border border-[#E0C475]/40 text-[#F59E35] text-[10px] font-light px-2 py-0.5 rounded-full">
                            {item.pv} PV
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6 border-t sm:border-t-0 border-[#FAF5EE] pt-3 sm:pt-0">
                    
                    {/* Quantity Selector */}
                    <div className="inline-flex items-center border border-[#E0C475]/40 rounded-xl bg-[#FAF5EE]/60 overflow-hidden">
                      <button
                        onClick={() => handleDecrease(product._id, item.quantity)}
                        className="p-1.5 px-2.5 text-slate-600 hover:text-[#DC2643] transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 py-1 text-xs font-light text-slate-800 border-x border-[#E0C475]/30 min-w-[32px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrease(product._id)}
                        className="p-1.5 px-2.5 text-slate-600 hover:text-[#DC2643] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Total Item Price */}
                    <span className="text-xs sm:text-sm font-light text-slate-900 min-w-[70px] text-right">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>

                    {/* Remove Item Button */}
                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="text-slate-400 hover:text-[#DC2643] p-1.5 rounded-lg hover:bg-[#DC2643]/10 transition cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-[#E0C475]/40 rounded-2xl p-6 space-y-5 sticky top-8 shadow-xs">
              <h2 className="text-sm font-light text-slate-800 tracking-tight border-b border-[#FAF5EE] pb-3">
                Order Summary
              </h2>

              <div className="space-y-3.5 text-xs font-light">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-800">
                    ₹{cart.totalAmount?.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Total PV Earned</span>
                  <span className="text-[#F59E35]">
                    {cart.totalPV || 0} PV
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Estimated Shipping</span>
                  <span className="text-[#DC2643]">
                    Complimentary
                  </span>
                </div>

                <div className="border-t border-[#FAF5EE] pt-3.5 flex justify-between items-baseline">
                  <span className="text-xs font-light text-slate-900">
                    Total Amount
                  </span>
                  <span className="text-lg font-light text-[#DC2643]">
                    ₹{cart.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate("/payment")}
                className="w-full bg-[#DC2643] hover:bg-[#c41e38] text-white text-xs font-light py-3.5 rounded-xl transition cursor-pointer shadow-xs active:scale-[0.99]"
              >
                Proceed To Checkout
              </button>

              {/* Assurance Badges */}
              <div className="pt-2 text-[10px] text-slate-400 font-light space-y-1.5">
                <p className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#F59E35]" /> Fast & Encrypted Checkout
                </p>
                <p className="flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3 text-[#E0C475]" /> Direct PV Credit to Account
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CartPage;