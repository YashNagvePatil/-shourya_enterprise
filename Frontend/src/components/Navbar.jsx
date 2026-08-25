import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useCart } from "../features/cart/hook/usecart"; 
import { useAuth } from "../features/auth/hook/useAuth";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, fetchCart } = useCart();
  
  // Auth hook se logged-in user details fetch karein
  const { user } = useAuth(); 

  // Component mount hone par current cart fetch karne ke liye
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Cart me total quantity sum
  const cartCount =
    cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Role ke basis par dashboard URL decide karne ke liye helper function
  const userRole = user?.role?.toLowerCase();

  const getDashboardPath = () => {
    if (userRole === "admin") return "/admin/dashboard";
    if (userRole=== "agent") return "/agent/dashboard";
    return null;
  };

  const dashboardPath = getDashboardPath(user?.role);

  return (
    <nav className="w-full bg-black/90 text-white border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Brand Logo */}
          <div className="shrink-0 flex items-center">
            <Link
              to="/"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <img
                src="/logo.png"
                alt="Company Logo"
                className="w-24 sm:w-28 md:w-32 h-auto object-contain"
              />
            </Link>
          </div>

          {/* Middle: Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-10 text-sm font-medium tracking-widest uppercase">
            <a
              href="#about"
              className="text-zinc-400 hover:text-white transition-colors duration-300 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all after:duration-300"
            >
              About Us
            </a>
            <a
              href="#vision"
              className="text-zinc-400 hover:text-white transition-colors duration-300 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all after:duration-300"
            >
              Our Vision
            </a>
            <a
              href="/contactUs"
              className="text-zinc-400 hover:text-white transition-colors duration-300 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all after:duration-300"
            >
              Contact Us
            </a>

            {/* Conditional Dashboard Link (Desktop) */}
            {dashboardPath && (
              <Link
                to={dashboardPath}
                className="text-zinc-400 hover:text-white transition-colors duration-300 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all after:duration-300"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right: Cart, Sign In & Mobile Toggle */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Dynamic Cart Icon Link */}
            <Link
              to="/cart"
              aria-label="Shopping Cart"
              className="relative p-2.5 text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 group inline-flex items-center justify-center"
            >
              <svg
                className="w-6 h-6 transition-transform group-hover:scale-105"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>

              {/* Dynamic Badge */}
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-white text-black text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Desktop Sign In Button */}
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-widest text-black bg-white rounded hover:bg-zinc-200 transition-colors duration-300"
            >
              Sign In
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/95 px-6 pt-4 pb-6 space-y-4">
          <a
            href="#about"
            className="block text-zinc-400 hover:text-white text-sm font-medium uppercase tracking-widest"
          >
            About Us
          </a>
          <a
            href="#vision"
            className="block text-zinc-400 hover:text-white text-sm font-medium uppercase tracking-widest"
          >
            Our Vision
          </a>
          <a
            href="#contact"
            className="block text-zinc-400 hover:text-white text-sm font-medium uppercase tracking-widest"
          >
            Contact Us
          </a>

          {/* Conditional Dashboard Link (Mobile) */}
          {dashboardPath && (
            <Link
              to={dashboardPath}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-zinc-400 hover:text-white text-sm font-medium uppercase tracking-widest"
            >
              Dashboard
            </Link>
          )}

          {/* Mobile Sign In Link */}
          <div className="pt-2 border-t border-white/10">
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-center w-full py-2.5 text-xs font-semibold uppercase tracking-widest text-black bg-white rounded hover:bg-zinc-200 transition-colors duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;