import React, { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    title: "ELEVATED MINIMALISM",
    subtitle: "Redefining modern aesthetics through dark luxury and precise craftsmanship.",
    ctaText: "EXPLORE COLLECTION",
    ctaLink: "#shop",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=2000"
  },
  {
    id: 2,
    title: "ARCHITECTURAL VISION",
    subtitle: "Shaping the future with bold forms, clean lines, and timeless monochrome tones.",
    ctaText: "DISCOVER VISION",
    ctaLink: "#vision",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=2000"
  },
  {
    id: 3,
    title: "PURE ESSENCE",
    subtitle: "Stripping away the noise to leave only what truly matters.",
    ctaText: "VIEW CATALOGUE",
    ctaLink: "#catalogue",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=2000"
  }
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <section className="relative w-full max-w-full h-[calc(100vh-80px)] min-h-[500px] max-h-[900px] bg-black text-white overflow-x-hidden">
      {/* Slide Items */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Background Image Overlay */}
          <div className="absolute inset-0 bg-black/60 z-10" />
          
          <div className="w-full h-full overflow-hidden">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover grayscale brightness-75 select-none"
            />
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-tight">
                {slide.title}
              </h1>
              <p className="text-zinc-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto tracking-wider font-light">
                {slide.subtitle}
              </p>
              <div className="pt-4">
                <a
                  href={slide.ctaLink}
                  className="inline-block bg-white text-black hover:bg-zinc-200 transition-colors duration-300 text-xs sm:text-sm font-semibold tracking-widest uppercase px-8 py-3.5 rounded-sm"
                >
                  {slide.ctaText}
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Left Control */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 text-white hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm border border-white/20"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Right Control */}
      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 text-white hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm border border-white/20"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-1 transition-all duration-500 rounded-full ${
              index === current ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;