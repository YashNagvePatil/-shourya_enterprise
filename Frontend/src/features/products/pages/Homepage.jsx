import React, { useState, useEffect } from "react";

// ================= STATIC DATA =================
const BANNERS = [
  {
    id: 1,
    title: "Next-Gen Kitchen Appliances",
    subtitle: "Experience high-efficiency smart cooking with automated precision.",
    tag: "Featured Collection",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1600&auto=format&fit=crop",
    cta: "Explore Kitchen Range",
  },
  {
    id: 2,
    title: "Smart Living & Air Purification",
    subtitle: "Breathe cleaner air with HEPA-filter smart home air purifiers.",
    tag: "New Arrival",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1600&auto=format&fit=crop",
    cta: "View Air Purifiers",
  },
  {
    id: 3,
    title: "Eco-Friendly Water Technology",
    subtitle: "Advanced RO + UV water purifiers designed for modern households.",
    tag: "Best Seller",
    image: "https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=1600&auto=format&fit=crop",
    cta: "Discover Water Tech",
  },
  {
    id: 4,
    title: "Automated Robot Vacuum Cleaners",
    subtitle: "Effortless cleaning with AI laser mapping and dual-mop technology.",
    tag: "Smart Tech",
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=1600&auto=format&fit=crop",
    cta: "See Robot Vacuums",
  },
  {
    id: 5,
    title: "Grow Your Distributor Business",
    subtitle: "Earn high commissions & BV points by showcasing premium appliances.",
    tag: "Business Opportunity",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
    cta: "Join Network Now",
  },
];

const PRODUCTS = [
  {
    id: 101,
    name: "Smart Induction Cooktop Pro",
    category: "Kitchen",
    price: "₹8,499",
    bvPoints: "120 BV",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop",
    badge: "Hot Seller",
  },
  {
    id: 102,
    name: "PureAir Smart HEPA Purifier",
    category: "Living",
    price: "₹14,999",
    bvPoints: "210 BV",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop",
    badge: "New",
  },
  {
    id: 103,
    name: "UltraRO Alkaline Water Purifier",
    category: "Health",
    price: "₹18,500",
    bvPoints: "280 BV",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=600&auto=format&fit=crop",
    badge: "Top Rated",
  },
  {
    id: 104,
    name: "RoboClean X-10 Vacuum Robot",
    category: "Cleaning",
    price: "₹24,999",
    bvPoints: "350 BV",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=600&auto=format&fit=crop",
    badge: "Smart Tech",
  },
  {
    id: 105,
    name: "Multi-Steam Smart Fryer 6L",
    category: "Kitchen",
    price: "₹6,999",
    bvPoints: "95 BV",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=600&auto=format&fit=crop",
    badge: "Popular",
  },
  {
    id: 106,
    name: "Smart Microwave Convection Oven",
    category: "Kitchen",
    price: "₹12,200",
    bvPoints: "160 BV",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=600&auto=format&fit=crop",
    badge: "Best Value",
  },
];

export const HomePage = () => {
  // Hero Banner Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto Play Slider (5 Seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));

  // Product Slider Scroll Function
  const slideLeft = () => {
    const slider = document.getElementById("product-slider");
    if (slider) slider.scrollLeft -= 320;
  };

  const slideRight = () => {
    const slider = document.getElementById("product-slider");
    if (slider) slider.scrollLeft += 320;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      
      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-sky-600/30">
              S
            </div>
            <span className="font-medium text-slate-900 tracking-tight text-sm sm:text-base">
              Smart<span className="font-bold text-sky-600">Appliances</span>
            </span>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-600">
            <a href="#home" className="text-sky-600 font-semibold">Home</a>
            <a href="#products" className="hover:text-slate-900 transition-colors">Products</a>
            <a href="#network" className="hover:text-slate-900 transition-colors">Business Network</a>
            <a href="#about" className="hover:text-slate-900 transition-colors">About Us</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <a
              href="/login"
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="px-4 py-1.5 text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
            >
              Become Partner
            </a>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 space-y-10 pb-12">
        
        {/* HERO BANNER SLIDER (4/5 IMAGES) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 shadow-xl h-[380px] sm:h-[460px] lg:h-[480px]">
            
            {/* Banner Slides */}
            {BANNERS.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                {/* Image Background */}
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />

                {/* Banner Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-12 lg:p-16 max-w-2xl text-white">
                  <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[11px] font-medium tracking-wide text-sky-300 w-fit mb-3">
                    {banner.tag}
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-light tracking-tight leading-tight text-white mb-3">
                    {banner.title.split(" ")[0]}{" "}
                    <span className="font-semibold text-sky-300">
                      {banner.title.split(" ").slice(1).join(" ")}
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mb-6 max-w-lg">
                    {banner.subtitle}
                  </p>
                  <div>
                    <a
                      href="#products"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs rounded-xl shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
                    >
                      {banner.cta} →
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {/* Prev / Next Controls */}
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/40 transition-all cursor-pointer"
            >
              ‹
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/40 transition-all cursor-pointer"
            >
              ›
            </button>

            {/* Indicator Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {BANNERS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentSlide === idx ? "w-6 bg-sky-400" : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

          </div>
        </section>

        {/* QUICK STATS / BUSINESS HIGHLIGHTS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <div className="p-3 text-center border-r border-slate-100 last:border-0">
              <h3 className="text-base sm:text-xl font-bold text-slate-900">100%</h3>
              <p className="text-[11px] text-slate-500">Genuine Products</p>
            </div>
            <div className="p-3 text-center sm:border-r border-slate-100">
              <h3 className="text-base sm:text-xl font-bold text-slate-900">2-Year</h3>
              <p className="text-[11px] text-slate-500">Brand Warranty</p>
            </div>
            <div className="p-3 text-center border-r border-slate-100">
              <h3 className="text-base sm:text-xl font-bold text-slate-900">Real-time</h3>
              <p className="text-[11px] text-slate-500">BV Points Credit</p>
            </div>
            <div className="p-3 text-center">
              <h3 className="text-base sm:text-xl font-bold text-slate-900">Fast</h3>
              <p className="text-[11px] text-slate-500">Doorstep Delivery</p>
            </div>
          </div>
        </section>

        {/* PRODUCTS SLIDER SECTION */}
        <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600">
                Premium Collection
              </span>
              <h2 className="text-xl sm:text-2xl font-light text-slate-900 tracking-tight mt-0.5">
                Featured Smart <span className="font-semibold text-slate-900">Appliances</span>
              </h2>
            </div>

            {/* Slider Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={slideLeft}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                title="Scroll Left"
              >
                ←
              </button>
              <button
                onClick={slideRight}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                title="Scroll Right"
              >
                →
              </button>
            </div>
          </div>

          {/* Scrollable Products List */}
          <div
            id="product-slider"
            className="flex gap-5 overflow-x-auto scroll-smooth scrollbar-none py-2 px-0.5"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="min-w-[260px] sm:min-w-[280px] max-w-[280px] bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Product Image & Badge */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                      {prod.badge}
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                      {prod.bvPoints}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>{prod.category}</span>
                      <span className="text-amber-500 font-medium">★ {prod.rating}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-sky-600 transition-colors">
                      {prod.name}
                    </h3>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-50 mt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Retail Price</span>
                    <span className="text-sm font-bold text-slate-900">{prod.price}</span>
                  </div>
                  <button className="px-3 py-1.5 bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-700 font-medium text-xs rounded-lg transition-colors cursor-pointer">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <span className="text-white font-medium">Smart Appliances Network</span>
          </div>
          <p className="text-[11px] text-slate-500 text-center sm:text-right">
            © {new Date().getFullYear()} Smart Appliances Inc. All Rights Reserved. Static UI Demo.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;