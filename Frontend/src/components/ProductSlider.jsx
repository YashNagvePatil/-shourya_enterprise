import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useGetProduct, getImageUrl } from "../features/products/hook/useGetProduct";
import { useCart } from "../features/cart/hook/usecart"; // Path apne project structure ke hisab se adjust karein
import { usePayment } from "../features/Payment/hook/usePayment";
import { createPayment } from "../features/Payment/service/payment.api";

const ProductCard = ({ product }) => {
  // Database Fields Extraction with Fallbacks
  const {
    _id,
    name = "Product Title",
    brand = "GENERIC",
    category = "GENERAL",
    mrp = 0,
    price = 0,
    pv = 0,
    images = [],
  } = product || {};

  const imageUrl = getImageUrl(images[0]);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const {executePayment} = usePayment()
  // Local Loading States for Buttons
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  // Discount Calculation
  const discountPercent =
    mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  // Static Rating Data
  const rating = 4.5;
  const reviewCount = 128;

  // 1. Add To Cart Handler
  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isAdding) return;
    try {
      setIsAdding(true);
      await addToCart(_id, 1);
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // 2. Buy Now Handler (Add to cart + Navigate to Cart/Checkout)
const handleBuyNow = async (e, productId) => {
  e.preventDefault();

  if (!productId) {
    alert("Product ID is missing!");
    return;
  }

  if (isBuying) return;

  try {
    setIsBuying(true);

    // STEP 1: Pehle DB me Order create karein
    // (Apni actual Order creation API ya Redux action ko yahan call karein)
    const orderResponse = await createPayment({ productId, quantity: 1 });

    if (!orderResponse || !orderResponse.order?._id) {
      alert("Order creation failed");
      return;
    }

    const createdOrderId = orderResponse.order._id;

    // STEP 2: Ab actual Order ID pass karein payment execution me
    const paymentResponse = await executePayment(createdOrderId);

    if (paymentResponse && paymentResponse.success) {
      navigate("/payment", { state: { orderId: createdOrderId } });
    } else {
      alert(paymentResponse?.message || "Payment Failed");
    }
  } catch (error) {
    console.error("Buy now failed:", error);
    alert(error.response?.data?.message || "Something went wrong!");
  } finally {
    setIsBuying(false);
  }
};

  return (
    <div className="flex-none w-64 sm:w-72 bg-zinc-950 border border-white/10 rounded-md group hover:border-white/30 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg">
      
      {/* 1. Image Container with Badges */}
      <Link to={`/products/${_id}`} className="relative aspect-square overflow-hidden bg-zinc-900 block">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
        />
        {/* Category Badge */}
        <span className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-semibold tracking-widest text-zinc-300 uppercase px-2 py-0.5 rounded">
          {category}
        </span>
        
        {/* PV Badge */}
        {pv > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-white text-black text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded shadow-sm">
            {pv} PV
          </span>
        )}
      </Link>

      {/* 2. Product Details */}
      <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
        <div className="space-y-1">
          {/* Brand Name */}
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            {brand}
          </span>

          {/* Product Title */}
          <Link to={`/products/${_id}`} className="block">
            <h3 className="text-sm font-semibold tracking-wide text-white line-clamp-1 group-hover:text-zinc-200 transition-colors">
              {name}
            </h3>
          </Link>

          {/* Rating Badge */}
          <div className="flex items-center space-x-2 pt-0.5">
            <span className="inline-flex items-center space-x-1 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold px-1.5 py-0.5 rounded">
              <span>{rating}</span>
              <svg className="w-3 h-3 fill-emerald-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
            <span className="text-[11px] text-zinc-500 font-medium">
              ({reviewCount})
            </span>
          </div>

          {/* Price & Discount Section */}
          <div className="flex items-baseline space-x-2 pt-2">
            <span className="text-base font-bold text-white">
              ₹{price.toLocaleString()}
            </span>

            {mrp > price && (
              <span className="text-xs text-zinc-500 line-through">
                ₹{mrp.toLocaleString()}
              </span>
            )}

            {discountPercent > 0 && (
              <span className="text-xs font-semibold text-emerald-400">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* 3. Action Buttons (Add To Cart + Buy Now) */}
        <div className="pt-2 flex items-center space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isBuying}
            className="flex-1 border border-white/20 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white transition-colors duration-300 text-[11px] font-bold uppercase tracking-wider py-2.5 rounded-sm flex items-center justify-center"
          >
            {isAdding ? (
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              "Add To Cart"
            )}
          </button>
          
          <button
            onClick={(e) => handleBuyNow(e, product._id)}
            disabled={isAdding || isBuying}
            className="flex-1 bg-white hover:bg-zinc-200 disabled:opacity-50 text-black transition-colors duration-300 text-[11px] font-bold uppercase tracking-wider py-2.5 rounded-sm flex items-center justify-center"
          >
            {isBuying ? (
              <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              "Buy Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Product Slider Component
const SingleProductSlider = ({ title, subtitle, products }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="py-8 border-b border-white/10 last:border-b-0">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-widest uppercase text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-zinc-400 font-light tracking-wide mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll Left"
            className="p-2.5 rounded-full border border-white/20 bg-zinc-900/80 text-white hover:bg-white hover:text-black transition-colors duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll Right"
            className="p-2.5 rounded-full border border-white/20 bg-zinc-900/80 text-white hover:bg-white hover:text-black transition-colors duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex space-x-6 overflow-x-auto px-4 sm:px-6 lg:px-8 scrollbar-none scroll-smooth pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <ProductCard key={product._id || product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

// Main Products Page Component
const ProductsPage = () => {
  const { products, isProductsLoading, productsError, fetchProducts } =
    useGetProduct();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categorisedProducts = products.reduce((acc, product) => {
    const cat = product.category || "ALL PRODUCTS";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black text-white pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 text-center border-b border-white/10">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight uppercase">
          PRODUCT CATALOGUE
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base font-light tracking-widest max-w-2xl mx-auto mt-3">
          Explore our luxury formulations, wellness products, and executive agent bundles.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {isProductsLoading && (
          <div className="flex justify-center items-center py-24 text-zinc-400">
            <span className="tracking-widest uppercase text-sm animate-pulse">
              Loading Catalog...
            </span>
          </div>
        )}

        {productsError && (
          <div className="text-center py-16 text-rose-500 font-semibold">
            {productsError}
          </div>
        )}

        {!isProductsLoading &&
          !productsError &&
          Object.keys(categorisedProducts).map((categoryName) => (
            <SingleProductSlider
              key={categoryName}
              title={categoryName}
              subtitle={`Top formulations in ${categoryName.toLowerCase()}`}
              products={categorisedProducts[categoryName]}
            />
          ))}

        {!isProductsLoading && products.length > 0 && Object.keys(categorisedProducts).length === 0 && (
          <SingleProductSlider
            title="ALL PRODUCTS"
            subtitle="Explore our full collection"
            products={products}
          />
        )}
      </div>
    </div>
  );
};

export default ProductsPage;