import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useCart } from "../hook/usecart"; // Path adjust kar lein
import { getImageUrl } from "../../products/hook/useGetProduct"; // Helper function

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
      <div className="min-h-screen bg-black flex justify-center items-center text-zinc-400">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="tracking-widest uppercase text-xs animate-pulse">
            Retrieving Cart...
          </span>
        </div>
      </div>
    );
  }

  // 2. Empty Cart State
  if (!isLoading && (!cart?.items || cart.items.length === 0)) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center mx-auto bg-zinc-950 text-zinc-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-widest uppercase">
            Your Cart is Empty
          </h2>
          <p className="text-zinc-400 text-xs tracking-wider leading-relaxed">
            Looks like you haven't added any luxury formulations to your cart yet.
          </p>
          <Link
            to="/"
            className="inline-block px-8 py-3.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-zinc-500 uppercase tracking-widest mb-8">
          <Link to="/products" className="hover:text-white transition-colors">
            Catalog
          </Link>
          <span>/</span>
          <span className="text-white">Cart</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-baseline justify-between border-b border-white/10 pb-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-widest uppercase">
            Your Selections
          </h1>
          <span className="text-xs text-zinc-400 tracking-wider">
            {cart?.items?.length} {cart?.items?.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-950/50 border border-rose-500/30 text-rose-400 text-xs rounded">
            {error}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Cart Items List (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {cart.items.map((item) => {
              const product = item.product || {};
              const imgUrl = getImageUrl(product.images?.[0]) || fallbackImage;

              return (
                <div
                  key={item._id || product._id}
                  className="bg-zinc-950 border border-white/10 rounded-md p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-white/20 transition-all"
                >
                  {/* Product Details & Image */}
                  <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-zinc-900 border border-white/10 rounded overflow-hidden flex-none">
                      <img
                        src={imgUrl}
                        alt={product.name || "Product"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        {product.brand || "GENERIC"}
                      </span>
                      <h3 className="text-sm font-semibold text-white line-clamp-1">
                        {product.name || "Product Name"}
                      </h3>
                      
                      <div className="flex items-center space-x-3 pt-1">
                        <span className="text-sm font-bold text-white">
                          ₹{item.price?.toLocaleString()}
                        </span>
                        {item.pv > 0 && (
                          <span className="bg-white/10 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded">
                            {item.pv} PV
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6 border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0">
                    
                    {/* Quantity Selector */}
                    <div className="inline-flex items-center border border-white/20 rounded bg-black">
                      <button
                        onClick={() => handleDecrease(product._id, item.quantity)}
                        className="px-3 py-1 text-zinc-400 hover:text-white transition-colors text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-white border-x border-white/10">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrease(product._id)}
                        className="px-3 py-1 text-zinc-400 hover:text-white transition-colors text-sm font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Total Item Price */}
                    <span className="text-sm font-bold text-white min-w-[80px] text-right">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>

                    {/* Remove Item Button */}
                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                      title="Remove Item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary Sidebar (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="bg-zinc-950 border border-white/10 rounded-md p-6 space-y-6 sticky top-8">
              <h2 className="text-lg font-bold tracking-widest uppercase border-b border-white/10 pb-4">
                Order Summary
              </h2>

              <div className="space-y-4 text-xs tracking-wider">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white font-semibold">
                    ₹{cart.totalAmount?.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>Total PV Earned</span>
                  <span className="text-emerald-400 font-bold">
                    {cart.totalPV || 0} PV
                  </span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>Estimated Shipping</span>
                  <span className="text-emerald-400 uppercase font-semibold">
                    Complimentary
                  </span>
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
                  <span className="text-sm font-bold uppercase text-white">
                    Total Amount
                  </span>
                  <span className="text-xl font-extrabold text-white">
                    ₹{cart.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate("/payment")}
                className="w-full bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-widest py-4 rounded-sm transition-colors duration-300 shadow-md"
              >
                Proceed To Checkout
              </button>

              {/* Assurance Badges */}
              <div className="pt-2 text-[10px] text-zinc-500 font-light tracking-wider uppercase space-y-2 text-center">
                <p>✓ Fast & Encrypted Checkout</p>
                <p>✓ Direct PV Credit to Account</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CartPage;