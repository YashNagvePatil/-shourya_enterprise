import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useGetProduct, getImageUrl } from "../features/products/hook/useGetProduct";
import { useCart } from "../features/cart/hook/usecart";
import { usePayment } from "../features/Payment/hook/usePayment";

const ProductCard = ({ product }) => {
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
  const { executePayment } = usePayment();

  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const discountPercent =
    mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const rating = 4.5;
  const reviewCount = 128;

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
const handleBuyNow = async (e) => {
  e.preventDefault();

  if (!_id) {
    alert("Product ID is missing!");
    return;
  }

  if (isBuying) return;

  try {
    setIsBuying(true);

    // 1. First add product to cart backend state
    await addToCart(_id, 1);

    // 2. Prepare payload for payment execution
    const cartPayload = {
      items: [{ productId: _id, quantity: 1, price }],
      amount: price,
      isDirectBuy: true // Flag to distinguish Buy Now from standard Cart
    };

    const userDetails = { name: "", email: "", phone: "" };

    // 3. Execute Payment
    const paymentResponse = await executePayment(cartPayload, userDetails);

    if (paymentResponse?.success) {
      // 4. Force redirect to Receipt / Payment confirmation page
      const orderId = paymentResponse.data?.dbOrderId 
        || paymentResponse.data?.orderId 
        || paymentResponse.data?.razorpay_order_id;

      navigate("/payment", {
        state: {
          orderId: orderId,
          receipt: paymentResponse.data?.receipt || paymentResponse.data?.razorpay_payment_id,
          paymentData: paymentResponse.data,
        },
        replace: true // Prevents back button loop to payment modal
      });
    } else if (paymentResponse?.message !== "Payment popup closed by user.") {
      alert(paymentResponse?.message || "Payment Failed");
    }
  } catch (error) {
    console.error("Buy now execution error:", error);
    alert(error.response?.data?.message || error.message || "Something went wrong!");
  } finally {
    setIsBuying(false);
  }
};

  return (
    <div className="flex-none w-64 sm:w-72 bg-white border border-[#D6B265]/30 rounded-xl group hover:border-[#DC2643]/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md">
      <Link to={`/products/${_id}`} className="relative aspect-square overflow-hidden bg-[#FAF5EE] block">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
        />
        <span className="absolute top-2.5 left-2.5 bg-[#2A1815]/90 backdrop-blur-md text-[10px] font-semibold tracking-widest text-[#FAF5EE] uppercase px-2 py-0.5 rounded-md">
          {category}
        </span>
        {pv > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-[#DC2643] text-white text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-md shadow-sm">
            {pv} PV
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-widest text-[#F59E35] uppercase">
            {brand}
          </span>
          <Link to={`/products/${_id}`} className="block">
            <h3 className="text-sm font-bold tracking-wide text-[#2A1815] line-clamp-1 group-hover:text-[#DC2643] transition-colors">
              {name}
            </h3>
          </Link>
          <div className="flex items-center space-x-2 pt-0.5">
            <span className="inline-flex items-center space-x-1 bg-[#F59E35]/15 border border-[#F59E35]/40 text-[#2A1815] text-[11px] font-bold px-1.5 py-0.5 rounded">
              <span>{rating}</span>
              <svg className="w-3 h-3 fill-[#F59E35]" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
            <span className="text-[11px] text-[#2A1815]/60 font-medium">
              ({reviewCount})
            </span>
          </div>

          <div className="flex items-baseline space-x-2 pt-2">
            <span className="text-base font-bold text-[#2A1815]">
              ₹{price.toLocaleString()}
            </span>
            {mrp > price && (
              <span className="text-xs text-[#2A1815]/40 line-through font-mono">
                ₹{mrp.toLocaleString()}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-xs font-bold text-[#DC2643]">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        <div className="pt-2 flex items-center space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isBuying}
            className="flex-1 border border-[#D6B265] bg-[#FAF5EE] hover:bg-[#D6B265]/20 disabled:opacity-50 text-[#2A1815] transition-colors duration-300 text-[11px] font-bold uppercase tracking-wider py-2.5 rounded-lg flex items-center justify-center cursor-pointer"
          >
            {isAdding ? (
              <span className="w-3.5 h-3.5 border-2 border-[#2A1815]/20 border-t-[#2A1815] rounded-full animate-spin" />
            ) : (
              "Add To Cart"
            )}
          </button>
          
          <button
            onClick={handleBuyNow}
            disabled={isAdding || isBuying}
            className="flex-1 bg-[#DC2643] hover:bg-[#2A1815] disabled:opacity-50 text-[#FAF5EE] transition-colors duration-300 text-[11px] font-bold uppercase tracking-wider py-2.5 rounded-lg flex items-center justify-center shadow-xs cursor-pointer"
          >
            {isBuying ? (
              <span className="w-3.5 h-3.5 border-2 border-[#FAF5EE]/20 border-t-[#FAF5EE] rounded-full animate-spin" />
            ) : (
              "Buy Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

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
    <div className="py-8 border-b border-[#D6B265]/20 last:border-b-0">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-widest uppercase text-[#2A1815]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#2A1815]/70 font-light tracking-wide mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll Left"
            className="p-2.5 rounded-full border border-[#D6B265]/40 bg-white text-[#2A1815] hover:bg-[#2A1815] hover:text-[#FAF5EE] transition-colors duration-300 shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll Right"
            className="p-2.5 rounded-full border border-[#D6B265]/40 bg-white text-[#2A1815] hover:bg-[#2A1815] hover:text-[#FAF5EE] transition-colors duration-300 shadow-xs cursor-pointer"
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
    <div className="min-h-screen bg-[#FAF5EE] text-[#2A1815] pt-6 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 text-center border-b border-[#D6B265]/30">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight uppercase text-[#2A1815]">
          PRODUCT CATALOGUE
        </h1>
        <p className="text-[#2A1815]/70 text-sm sm:text-base font-normal tracking-wide max-w-2xl mx-auto mt-3">
          Explore our luxury formulations, wellness products, and executive agent bundles.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {isProductsLoading && (
          <div className="flex justify-center items-center py-24 text-[#DC2643]">
            <span className="tracking-widest uppercase text-sm font-semibold animate-pulse">
              Loading Catalog...
            </span>
          </div>
        )}

        {productsError && (
          <div className="text-center py-16 text-[#DC2643] font-semibold">
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