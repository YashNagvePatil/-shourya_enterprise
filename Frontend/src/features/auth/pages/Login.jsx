import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";

export const LoginPage = () => {
  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  // Remember Me checkbox state
  const [rememberMe, setRememberMe] = useState(false);

  // Form Input State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Hook & Navigation
  const { handleLogin, loading, error } = useAuth();
  const navigate = useNavigate();

  // Load Remembered Identifier on Mount
  useEffect(() => {
    const savedIdentifier = localStorage.getItem("remembered_identifier");
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
      setRememberMe(true);
    }
  }, []);

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identifier || !password) return;

    // Handle Remember Me logic
    if (rememberMe) {
      localStorage.setItem("remembered_identifier", identifier);
    } else {
      localStorage.removeItem("remembered_identifier");
    }

    // Backend payload structure matching controller
    const result = await handleLogin({
      identifier,
      password,
    });

    if (result?.success) {
      // Redirect on successful login
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-50 font-light text-slate-600 antialiased selection:bg-amber-100 selection:text-amber-800">
      
      {/* Left Branding Sidebar (Matching Warm Palette) */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-rose-600 via-amber-500 to-yellow-500 p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] tracking-widest uppercase font-light border border-white/20">
            Unified Portal
          </span>
          <h1 className="text-3xl font-extralight tracking-wide mt-4 uppercase">
            Smart Appliances Network
          </h1>
        </div>

        <div className="space-y-4 relative z-10">
          <h2 className="text-4xl font-extralight leading-tight">
            Welcome Back to Your Network Dashboard.
          </h2>
          <p className="text-amber-50 text-xs font-light leading-relaxed max-w-md">
            Track real-time binary tree matching, volume growth, distributor payouts, and franchise management in one unified portal.
          </p>
        </div>

        <div className="text-[11px] text-amber-100/70 font-light tracking-wide relative z-10">
          Enterprise Logistics v2.4
        </div>
      </div>

      {/* Right Form Container */}
      <div className="w-full lg:w-7/12 p-6 sm:p-10 md:p-14 overflow-y-auto max-h-screen bg-white flex flex-col justify-center">
        <div className="max-w-xl mx-auto w-full space-y-8">
          
          {/* Header */}
          <div>
            <h2 className="text-2xl font-light text-slate-800 tracking-tight">
              Sign In to Account
            </h2>
            <p className="text-xs font-light text-slate-400 mt-1">
              Enter your credentials to access your agent, franchise, or admin dashboard.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 text-xs font-light bg-red-50/80 text-red-600 border border-red-100 rounded-lg flex items-center gap-2 animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Account Credentials Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <h3 className="text-xs font-normal uppercase tracking-wider text-slate-500">
                  Account Credentials
                </h3>
              </div>

              {/* Identifier Input */}
              <div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Agent ID / Email Address / Mobile Number *"
                  className="w-full p-3 bg-stone-50/50 border border-slate-200/80 rounded-lg text-xs font-light focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password *"
                  className="w-full p-3 bg-stone-50/50 border border-slate-200/80 rounded-lg text-xs font-light focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all placeholder:text-slate-400 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-0.5"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.274 4.057 5.065 7 9.542 7 4.477 0 8.268-2.943 9.542-7-1.274-4.057-5.064-7-9.542-7-4.477 0-8.268 2.943-9.542 7Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600"
                  />
                  <span className="text-xs font-light text-slate-500">Remember me</span>
                </label>

                <a href="#forgot" className="text-xs font-light text-rose-600 hover:underline">
                  Forgot Password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-amber-500 to-yellow-500 hover:from-rose-700 hover:to-yellow-600 text-white rounded-lg text-xs font-normal tracking-wide shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Authenticating..." : "Sign In to Dashboard →"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <p className="text-xs font-light text-slate-400">
              Don't have an account yet?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-amber-600 hover:underline font-normal inline-block ml-1 cursor-pointer focus:outline-none"
              >
                Register as Distributor
              </button>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default LoginPage;