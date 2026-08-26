import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { franchiseLogin } from "../services/franchiseApi";
import { useFranchise } from "../hooks/useFranchise";

const Franchiselogin = () => {
  const navigate = useNavigate();
  const { handleSetUser } = useFranchise();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await franchiseLogin(credentials);
      if (res.success) {
        handleSetUser(res.user);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-50 font-light text-slate-700">
      {/* Left Branding Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-600 p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <h1 className="text-3xl font-extralight tracking-widest uppercase">Apex Franchise</h1>
          <p className="mt-2 text-amber-100 font-light text-sm">Enterprise Management Portal</p>
        </div>
        <div className="relative z-10 space-y-4 max-w-md">
          <h2 className="text-4xl font-light leading-tight">Empowering Regional Operations & Growth</h2>
          <p className="text-amber-100 text-sm font-light leading-relaxed">
            Access financial metrics, monitor inventory distribution, and streamline regional supply requests in real time.
          </p>
        </div>
        <div className="relative z-10 text-xs text-amber-200">
          © {new Date().getFullYear()} Apex Networks. All rights reserved.
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-light text-slate-800 tracking-tight">Franchise Login</h2>
            <p className="mt-2 text-sm text-slate-400 font-light">Sign in to manage your branch operations</p>
          </div>

          {error && (
            <div className="p-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-normal text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={credentials.email}
                onChange={handleChange}
                placeholder="franchise@domain.com"
                className="w-full px-4 py-3 bg-stone-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm font-light transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-normal text-slate-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={credentials.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-stone-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm font-light transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-lg text-sm font-normal hover:from-amber-600 hover:to-yellow-700 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 font-light">
            Need a new franchise account?{" "}
            <Link to="/register" className="text-amber-600 font-normal hover:underline">
              Register Branch
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Franchiselogin