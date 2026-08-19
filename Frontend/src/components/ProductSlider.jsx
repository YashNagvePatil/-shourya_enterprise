import React, { useRef } from 'react';
import { Link } from 'react-router';

// Sample Product Data categorized into 4 Sliders
const sliderCategories = [
  {
    id: "featured",
    title: "FEATURED COLLECTION",
    subtitle: "Our flagship luxury formulations engineered for ultimate performance.",
    products: [
      { id: 101, name: "BLACK ORCHID ELIXIR", category: "SKINCARE", price: "$140", pv: "100 PV", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800" },
      { id: 102, name: "OBSIDIAN NUTRITION", category: "WELLNESS", price: "$95", pv: "70 PV", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800" },
      { id: 103, name: "NOCTURNE SERUM", category: "SKINCARE", price: "$180", pv: "130 PV", image: "https://images.unsplash.com/photo-1608248597309-1e5f32bb4f7d?auto=format&fit=crop&q=80&w=800" },
      { id: 104, name: "MONOCHROME HYDRATION", category: "WELLNESS", price: "$85", pv: "60 PV", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800" },
      { id: 105, name: "VELVET ESSENCE", category: "FRAGRANCE", price: "$210", pv: "150 PV", image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800" },
    ]
  },
  {
    id: "best-sellers",
    title: "BEST SELLERS",
    subtitle: "Proven top-tier products driving global network volume.",
    products: [
      { id: 201, name: "ALPHA CELL COMPLEX", category: "SUPPLEMENTS", price: "$110", pv: "80 PV", image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&q=80&w=800" },
      { id: 202, name: "PURE COLLAGEN BOOSTER", category: "BEAUTY", price: "$125", pv: "90 PV", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800" },
      { id: 203, name: "ZENITH DETOX TEA", category: "WELLNESS", price: "$65", pv: "45 PV", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800" },
      { id: 204, name: "DARK CAVIAR CREAM", category: "SKINCARE", price: "$220", pv: "160 PV", image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=800" },
      { id: 205, name: "VITALITY PACK", category: "SUPPLEMENTS", price: "$150", pv: "110 PV", image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=800" },
    ]
  },
  {
    id: "agent-bundles",
    title: "EXECUTIVE BUNDLES",
    subtitle: "High-PV business starter packs tailored for independent agents.",
    products: [
      { id: 301, name: "FOUNDER'S KICKOFF KIT", category: "STARTER PACK", price: "$499", pv: "400 PV", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800" },
      { id: 302, name: "PRO BUILDER TRIO", category: "BUSINESS PACK", price: "$899", pv: "750 PV", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800" },
      { id: 303, name: "ULTIMATE NETWORK BUNDLE", category: "VIP PACK", price: "$1,299", pv: "1100 PV", image: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800" },
      { id: 304, name: "RETAIL EXPANSION BOX", category: "AGENT PACK", price: "$650", pv: "500 PV", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800" },
    ]
  },
  {
    id: "new-arrivals",
    title: "NEW ARRIVALS",
    subtitle: "The latest additions to our dark luxury catalog.",
    products: [
      { id: 401, name: "NIGHT RECOVERY OIL", category: "SKINCARE", price: "$130", pv: "95 PV", image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=800" },
      { id: 402, name: "MATTE LIP SCULPT", category: "COSMETICS", price: "$48", pv: "30 PV", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800" },
      { id: 403, name: "NEURO-ENERGY SHOTS", category: "WELLNESS", price: "$80", pv: "55 PV", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800" },
      { id: 404, name: "CARBON FACE MASK", category: "SKINCARE", price: "$75", pv: "50 PV", image: "https://images.unsplash.com/photo-1567928269937-ae146e45b428?auto=format&fit=crop&q=80&w=800" },
      { id: 405, name: "GOLD INFUSED TONER", category: "SKINCARE", price: "$165", pv: "120 PV", image: "https://images.unsplash.com/photo-1556228722-d1193828e306?auto=format&fit=crop&q=80&w=800" },
    ]
  }
];

// Single Reusable Product Slider Component
const SingleProductSlider = ({ category }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="py-10 border-b border-white/10 last:border-b-0">
      {/* Slider Header & Nav Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-widest uppercase text-white">
            {category.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-light tracking-wide mt-1">
            {category.subtitle}
          </p>
        </div>

        {/* Scroll Buttons */}
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll Left"
            className="p-2.5 rounded-full border border-white/20 bg-zinc-900/80 text-white hover:bg-white hover:text-black transition-colors duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll Right"
            className="p-2.5 rounded-full border border-white/20 bg-zinc-900/80 text-white hover:bg-white hover:text-black transition-colors duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        className="flex space-x-6 overflow-x-auto px-4 sm:px-6 lg:px-8 scrollbar-none scroll-smooth pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {category.products.map((product) => (
          <div
            key={product.id}
            className="flex-none w-64 sm:w-72 bg-zinc-950 border border-white/10 rounded-sm group hover:border-white/40 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Image Container with Hover Zoom */}
            <div className="relative aspect-square overflow-hidden bg-zinc-900">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              />
              <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-semibold tracking-widest text-zinc-300 uppercase px-2 py-1">
                {product.category}
              </span>
              <span className="absolute top-3 right-3 bg-white text-black text-[10px] font-bold tracking-wider px-2 py-1">
                {product.pv}
              </span>
            </div>

            {/* Product Meta */}
            <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase text-white group-hover:text-zinc-300 transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs font-light text-zinc-400 mt-1">
                  {product.price}
                </p>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center space-x-2">
                <button className="flex-1 bg-white text-black hover:bg-zinc-200 transition-colors duration-300 text-[11px] font-semibold uppercase tracking-widest py-2.5 text-center">
                  Add To Cart
                </button>
                <Link
                  to={`/products/${product.id}`}
                  className="p-2 border border-white/20 text-zinc-300 hover:text-white hover:border-white transition-colors"
                  aria-label="View Details"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Products Page Component
const ProductsPage = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-6 pb-20">
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 text-center border-b border-white/10">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight uppercase">
          PRODUCT CATALOGUE
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base font-light tracking-widest max-w-2xl mx-auto mt-3">
          Explore our complete monochrome line of wellness, skincare, and executive agent bundles.
        </p>
      </div>

      {/* 4 Product Sliders */}
      <div className="max-w-7xl mx-auto">
        {sliderCategories.map((category) => (
          <SingleProductSlider key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;