import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useGetProduct } from "../hook/useGetProduct"
import { getImageUrl } from "../hook/useGetProduct";
const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  

  // Custom Hook Connectivity
  const {
    selectedProduct,
    relatedProducts = [],
    isDetailsLoading,
    detailsError,
    fetchDetails,
    resetDetails,
  } = useGetProduct();





  // Component States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Fetch product on mount and when ID changes
  useEffect(() => {
    if (id) {
      fetchDetails(id);
      setSelectedImageIndex(0);
      setQuantity(1);
    }

    // Cleanup state on unmount
    return () => {
      resetDetails();
    };
  }, [id, fetchDetails, resetDetails]);

  // Loading State
  if (isDetailsLoading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center text-zinc-400">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="tracking-widest uppercase text-xs animate-pulse">
            Loading Details...
          </span>
        </div>
      </div>
    );
  }

  // Error State
  if (detailsError) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center text-white px-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-rose-500">
            Error Loading Product
          </h2>
          <p className="text-zinc-400 text-sm">{detailsError}</p>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
          >
            Back To Catalog
          </button>
        </div>
      </div>
    );
  }

  if (!selectedProduct) return null;

  // Extract Product Data with Fallbacks
  const {
    _id,
    name = "Product Title",
    brand = "GENERIC",
    category = "GENERAL",
    description = "No description available for this formulation.",
    mrp = 0,
    price = 0,
    pv = 0,
    images = [],
    stock = 10,
  } = selectedProduct;

  const fallbackImage =
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800";
  const displayImages =
    images.length > 0
      ? images.map((img) => getImageUrl(img))
      : [fallbackImage];
  const discountPercent =
    mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  // Static Details (Can be made dynamic)
  const rating = 4.8;
  const reviewCount = 254;

  return (
    <div className="min-h-screen bg-black text-white pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-zinc-500 uppercase tracking-widest mb-8">
          <Link to="/products" className="hover:text-white transition-colors">
            Catalog
          </Link>
          <span>/</span>
          <span className="text-zinc-400">{category}</span>
          <span>/</span>
          <span className="text-white line-clamp-1">{name}</span>
        </nav>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Image Gallery (5 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Active Image Display */}
            <div className="relative aspect-square bg-zinc-950 border border-white/10 overflow-hidden rounded-md group">
              <img
                src={displayImages[selectedImageIndex]}
                alt={name}
                className="w-full h-full object-cover transition-all duration-500"
              />
              {/* Category Badge */}
              <span className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-semibold tracking-widest text-zinc-300 uppercase px-3 py-1 rounded">
                {category}
              </span>

              {/* PV Badge */}
              {pv > 0 && (
                <span className="absolute top-4 right-4 bg-white text-black text-xs font-extrabold tracking-wider px-3 py-1 rounded shadow-md">
                  {pv} PV
                </span>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {displayImages.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 flex-none rounded border overflow-hidden transition-all ${
                      selectedImageIndex === idx
                        ? "border-white opacity-100"
                        : "border-white/10 opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${name} thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Brand & Stock Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
                  {brand}
                </span>
                <span
                  className={`text-[11px] font-semibold tracking-wider px-2.5 py-0.5 rounded ${
                    stock > 0
                      ? "bg-emerald-950/80 border border-emerald-500/30 text-emerald-400"
                      : "bg-rose-950/80 border border-rose-500/30 text-rose-400"
                  }`}
                >
                  {stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
                {name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center space-x-3 pt-1">
                <div className="flex items-center space-x-1 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded">
                  <span>{rating}</span>
                  <svg className="w-3.5 h-3.5 fill-emerald-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-xs text-zinc-500 font-medium">
                  {reviewCount} Verified Ratings
                </span>
              </div>

              {/* Price & Discount Section */}
              <div className="flex items-baseline space-x-3 pt-3 border-t border-white/10">
                <span className="text-3xl font-extrabold text-white">
                  ₹{price.toLocaleString()}
                </span>

                {mrp > price && (
                  <span className="text-sm text-zinc-500 line-through">
                    ₹{mrp.toLocaleString()}
                  </span>
                )}

                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/50 px-2 py-0.5 border border-emerald-500/20 rounded">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="pt-2 text-zinc-400 text-sm leading-relaxed font-light">
                {description}
              </div>

              {/* Quantity Selector */}
              <div className="pt-4 space-y-2">
                <label className="text-xs uppercase font-semibold tracking-widest text-zinc-400 block">
                  Quantity
                </label>
                <div className="inline-flex items-center border border-white/20 rounded bg-zinc-950">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-bold text-white border-x border-white/10">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  disabled={stock <= 0}
                  className="w-full border border-white/20 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white transition-colors duration-300 text-xs font-bold uppercase tracking-widest py-3.5 rounded-sm"
                >
                  Add To Cart
                </button>

                <button
                  disabled={stock <= 0}
                  className="w-full bg-white hover:bg-zinc-200 disabled:opacity-50 text-black transition-colors duration-300 text-xs font-bold uppercase tracking-widest py-3.5 rounded-sm"
                >
                  Buy Now
                </button>
              </div>

              {/* Guarantee / Info Badges */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-zinc-500 font-light tracking-wider uppercase">
                <div className="flex items-center space-x-2">
                  <span>✓ 100% Authentic Product</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✓ Secure Transactions</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold tracking-widest uppercase text-white mb-6">
              You May Also Like
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => {
                const relImgUrl = getImageUrl(relProduct.images?.[0]) || fallbackImage;
              return(
                <div
                  key={relProduct._id}
                  onClick={() => navigate(`/products/${relProduct._id}`)}
                  className="bg-zinc-950 border border-white/10 rounded overflow-hidden cursor-pointer group hover:border-white/30 transition-all"
                >
                  <div className="aspect-square bg-zinc-900 overflow-hidden">
                    <img
                      src={
                        relImgUrl || fallbackImage
                      }
                      alt={relProduct.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  <div className="p-4 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      {relProduct.brand || "GENERIC"}
                    </span>
                    <h4 className="text-xs font-semibold text-white line-clamp-1">
                      {relProduct.name}
                    </h4>
                    <p className="text-sm font-bold text-white pt-1">
                      ₹{relProduct.price?.toLocaleString()}
                    </p>
                  </div>
                </div>
              )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailsPage;