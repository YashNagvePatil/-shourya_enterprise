import React, { useState } from "react";

export const LoginPage = () => {
  // 👁️ Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  // Remember Me checkbox state
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="h-screen bg-slate-50 text-slate-800 font-sans flex items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Main Container */}
      <div className="w-full max-w-7xl h-full lg:h-[94vh] grid grid-cols-1 lg:grid-cols-12 bg-white shadow-xl sm:rounded-2xl border border-slate-100 overflow-hidden">
        
        {/* ================= LEFT SIDE: Home Appliance Showcase BG ================= */}
        <div className="relative hidden lg:flex lg:col-span-5 bg-slate-900 flex-col justify-between p-8 text-white overflow-hidden">
          {/* Background Image Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

          {/* Top Branding */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Smart Appliances Network
            </div>
            <h1 className="mt-4 text-2xl xl:text-3xl font-light tracking-tight text-white leading-tight">
              Welcome Back to <br />
              <span className="font-semibold text-sky-300">
                Distributor Dashboard
              </span>
            </h1>
          </div>

          {/* Bottom Features List */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 mt-0.5 text-sm">
                📊
              </div>
              <div>
                <h4 className="text-xs font-medium text-white">Real-time Analytics</h4>
                <p className="text-[11px] text-slate-300 leading-tight">Monitor sales volume, binary tree matching, and commissions live.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 mt-0.5 text-sm">
                🔒
              </div>
              <div>
                <h4 className="text-xs font-medium text-white">Secure Access</h4>
                <p className="text-[11px] text-slate-300 leading-tight">Protected portal for official distributors and franchise partners.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: Login Form UI ================= */}
        <div className="lg:col-span-7 p-6 sm:p-12 flex flex-col justify-center bg-white overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight">
                Sign In to <span className="font-semibold text-sky-600">Account</span>
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-1">
                Enter your credentials to access your agent dashboard.
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              
              {/* Agent ID or Email */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Agent ID / Email Address *
                </label>
                <input
                  type="text"
                  placeholder="AGT1001 or name@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>

              {/* Password Field with Show/Hide Toggle */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-0.5"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      // Eye Off Icon
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      // Eye Icon
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
                    className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 accent-sky-600 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium">Remember me</span>
                </label>

                <a href="#forgot" className="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs sm:text-sm rounded-xl shadow-md shadow-sky-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Sign In to Dashboard →
              </button>

              {/* Navigation Link to Register */}
              <p className="text-center text-xs text-slate-500 mt-4">
                Don't have an account yet?{" "}
                <a href="/register" className="text-sky-600 hover:text-sky-700 font-semibold hover:underline">
                  Register as Distributor
                </a>
              </p>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;