import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useGetProduct, getImageUrl } from "../features/products/hook/useGetProduct";
import { useCart } from "../features/cart/hook/usecart";
import { usePayment } from "../features/Payment/hook/usePayment";

const ProductCard = ({ product }) => {
  const {
    _id,
    name = "Product Title",
    category = "GENERAL",
    brand,
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
    if (!_id || isBuying) return;

    try {
      setIsBuying(true);
      await addToCart(_id, 1);

      const cartPayload = {
        items: [{ productId: _id, quantity: 1, price }],
        amount: price,
        isDirectBuy: true,
      };

      const userDetails = { name: "", email: "", phone: "" };
      const paymentResponse = await executePayment(cartPayload, userDetails);

      if (paymentResponse?.success) {
        const orderId =
          paymentResponse.data?.dbOrderId ||
          paymentResponse.data?.receiptData?.dbOrderId ||
          paymentResponse.data?.orderId ||
          paymentResponse.data?.razorpay_order_id;

        navigate(`/receipt/${orderId}`, {
          state: {
            orderId: orderId,
            receiptData: paymentResponse.data?.receiptData,
            paymentData: paymentResponse.data,
          },
          replace: true,
        });
      } else if (paymentResponse?.message !== "Payment popup closed by user.") {
        alert(paymentResponse?.message || "Payment Failed");
      }
    } catch (error) {
      console.error("Buy now execution error:", error);
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-slate-200/80 hover:border-[#D6B265] hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">

      {/* Image Stage */}
      <Link to={`/products/${_id}`} className="relative aspect-square bg-[#FAF5EE] block p-[#121212] overflow-hidden flex items-center justify-center">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />

        {pv > 0 && (
          <span className="absolute top-3 right-3 bg-[#2A1815] text-[#FAF5EE] text-[10px] font-bold tracking-wider px-2 py-0.5 rounded">
            {pv} PV
          </span>
        )}
      </Link>

      {/* Info Container */}
      <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#2A1815]/50 uppercase block">
            {brand}
          </span>
          <Link to={`/products/${_id}`} className="block mt-1">
            <h3 className="text-sm font-semibold text-[#2A1815] line-clamp-2 hover:text-[#DC2643] transition-colors leading-snug">
              {name}
            </h3>
          </Link>

          <div className="flex items-baseline space-x-2 pt-2">
            <span className="text-base font-bold text-[#2A1815]">
              ₹{price.toLocaleString()}
            </span>
            {mrp > price && (
              <span className="text-xs text-slate-400 line-through">
                ₹{mrp.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-2 grid grid-cols-2 gap-2 border-t border-slate-100">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isBuying}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-[#2A1815] text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
          >
            {isAdding ? "..." : "Add to Cart"}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isAdding || isBuying}
            className="w-full py-2 bg-[#DC2643] hover:bg-[#2A1815] disabled:opacity-50 text-white text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
          >
            {isBuying ? "..." : "Buy Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductsPage = () => {
  const { products, isProductsLoading, productsError, fetchProducts } = useGetProduct();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const allProducts = useMemo(() => {
    if (products && Array.isArray(products)) {
      return products;
    }
    return [];
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set();
    allProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["ALL", ...Array.from(set)];
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.category?.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== "ALL") {
      result = result.filter(
        (p) => p.category?.toUpperCase() === selectedCategory.toUpperCase()
      );
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "pv-high") {
      result.sort((a, b) => (b.pv || 0) - (a.pv || 0));
    }

    return result;
  }, [allProducts, searchTerm, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAF5EE] text-[#2A1815] font-sans pb-20">

      {/* Clean Minimal Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 border-b border-slate-200/60">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase text-[#2A1815]">
          Product Catalogue
        </h1>
        <p className="text-[#2A1815]/60 text-sm mt-1">
          Browse our collection of health formulations, wellness products & packages.
        </p>

        {/* Minimal Control Bar */}
        <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between">

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-colors whitespace-nowrap cursor-pointer ${selectedCategory === cat
                  ? "bg-[#2A1815] text-[#FAF5EE]"
                  : "bg-white text-[#2A1815]/70 hover:bg-slate-100 border border-slate-200"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full md:w-56 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#DC2643]"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 text-[#2A1815] text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#DC2643]"
            >
              <option value="default">Sort: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="pv-high">Highest PV</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {isProductsLoading ? (
          <div className="text-center py-16 text-xs text-[#2A1815]/60">
            Loading products...
          </div>
        ) : productsError ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm font-medium text-red-600">{productsError}</p>
            <button
              onClick={() => fetchProducts()}
              className="mt-3 px-4 py-2 bg-[#2A1815] text-white text-xs rounded-lg hover:bg-slate-800 transition-colors"
            >
              Retry Loading Products
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <p className="text-sm font-medium text-[#2A1815]">No products found</p>
            {(searchTerm || selectedCategory !== "ALL") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("ALL");
                }}
                className="mt-3 text-xs text-[#DC2643] underline font-medium cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;