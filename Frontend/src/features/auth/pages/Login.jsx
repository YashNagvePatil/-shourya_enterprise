import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
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

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("clicked")
    if (!identifier || !password) return;

    // Backend payload structure matching controller
    const result = await handleLogin({
      identifier,
      password,
    });

    if (result.success) {
      // Redirect on successful login
      navigate("/"); 
    }
  };

  return (
    <div className="h-screen bg-slate-100 text-slate-900 font-sans flex items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Main Container */}
      <div className="w-full max-w-7xl h-full lg:h-[94vh] grid grid-cols-1 lg:grid-cols-12 bg-white shadow-2xl sm:rounded-2xl border border-slate-200 overflow-hidden">
        
        {/* ================= LEFT SIDE: Grayscale Home Appliance Showcase BG ================= */}
        <div className="relative hidden lg:flex lg:col-span-5 bg-slate-950 flex-col justify-between p-8 text-white overflow-hidden">
          {/* Background Image Overlay with Grayscale Filters */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity grayscale contrast-125"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent" />

          {/* Top Branding */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse"></span>
              Smart Appliances Network
            </div>
            <h1 className="mt-4 text-2xl xl:text-3xl font-light tracking-tight text-white leading-tight">
              Welcome Back to <br />
              <span className="font-semibold text-white tracking-normal">
                Distributor Dashboard
              </span>
            </h1>
          </div>

          {/* Bottom Features List */}
          <div className="relative z-10 space-y-4 border-t border-white/10 pt-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/5 mt-0.5 text-xs text-slate-300">
                ■
              </div>
              <div>
                <h4 className="text-xs font-medium text-white tracking-wide">Real-time Analytics</h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Monitor sales volume, binary tree matching, and commissions live.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/5 mt-0.5 text-xs text-slate-300">
                ■
              </div>
              <div>
                <h4 className="text-xs font-medium text-white tracking-wide">Secure Access</h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Protected portal for official distributors and franchise partners.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: Balanced Monochrome Form UI ================= */}
        <div className="lg:col-span-7 p-6 sm:p-12 flex flex-col justify-center bg-white overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-light text-slate-900 tracking-tight">
                Sign In to <span className="font-semibold">Account</span>
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Enter your credentials to access your agent dashboard.
              </p>
            </div>

            {/* Error Alert Box */}
            {error && (
              <div className="mb-4 p-2.5 bg-slate-50 border border-slate-400 text-slate-900 text-xs font-medium rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 fill-current text-slate-800" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Agent ID or Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Agent ID / Email Address / Phone *
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="AGT1001, name@example.com, or phone"
                  className="w-full px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-600 transition-all"
                />
              </div>

              {/* Password Field with Show/Hide Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-600 transition-all pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 focus:outline-none cursor-pointer p-0.5"
                    title={showPassword ? "Hide password" : "Show password"}
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
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500 accent-slate-800 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium">Remember me</span>
                </label>

                <a href="#forgot" className="text-xs font-medium text-slate-700 hover:text-slate-900 hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Adjusted Submit Button (Slate-Gray Palette) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In to Dashboard →</span>
                )}
              </button>

              {/* Navigation Link to Register */}
              <p className="text-center text-xs text-slate-500 mt-4">
                Don't have an account yet?{" "}
                <Link to="/register" className="text-slate-800 font-semibold hover:underline">
                  Register as Distributor
                </Link>
              </p>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;