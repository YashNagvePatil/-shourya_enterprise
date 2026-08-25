import React, { useState } from "react";
import { useAuth } from "../hook/useAuth.js";

// Initial state object for easy reset
const initialFormData = {
  fullName: "",
  email: "",
  contact: "",
  password: "",
  role: "Agent",
  panCardImage: "",
  adharCardImage: "",
  parentAgentId: "",
  parrentAgentName: "",
};

export const RegisterPage = () => {
  // 1. Hook and State Management
  const { handleRegister, loading, error } = useAuth();

  const [position, setPosition] = useState("left");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  // Helper Function: Convert File to Base64 String
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
  };

  // Text Input Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // File Input Handler
  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      try {
        const base64String = await convertToBase64(files[0]);
        setFormData((prev) => ({
          ...prev,
          [name]: base64String,
        }));
      } catch (err) {
        console.error("Base64 conversion failed:", err);
      }
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.panCardImage || !formData.adharCardImage) {
      alert("Please upload both PAN and Aadhaar Card images.");
      return;
    }

    const res = await handleRegister({
      ...formData,
      position,
    });

    if (res?.success) {
      alert("Registration Successful!");

      // ✅ Form State and File Input Fields Clear/Reset
      setFormData(initialFormData);
      setPosition("left");
      e.target.reset(); // Native DOM form reset (clears HTML file inputs)
    }
  };

  return (
    <div className="h-screen bg-slate-100 text-slate-900 font-sans flex items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Main Container */}
      <div className="w-full max-w-7xl h-full lg:h-[94vh] grid grid-cols-1 lg:grid-cols-12 bg-white shadow-2xl sm:rounded-2xl border border-slate-200 overflow-hidden">

        {/* LEFT SIDE: Showcase BG */}
        <div className="relative hidden lg:flex lg:col-span-5 bg-slate-950 flex-col justify-between p-8 text-white overflow-hidden">
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
              Build Your Business with <br />
              <span className="font-semibold text-white tracking-normal">
                Next-Gen Home Appliances
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
                <h4 className="text-xs font-medium text-white tracking-wide">Premium Quality Products</h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Kitchen & Living Smart Appliances with Extended Warranty.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/5 mt-0.5 text-xs text-slate-300">
                ■
              </div>
              <div>
                <h4 className="text-xs font-medium text-white tracking-wide">Transparent Binary Growth</h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Track BV Points, Matching Bonus, and Direct Commissions in real-time.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Form UI */}
        <div className="lg:col-span-7 p-5 sm:p-8 flex flex-col justify-center bg-white overflow-y-auto">
          <div className="max-w-xl mx-auto w-full">

            {/* Header */}
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl font-light text-slate-900 tracking-tight">
                Create Distributor <span className="font-semibold">Account</span>
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Fill in your registration details to join the agent network.
              </p>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="mb-3 p-2.5 bg-slate-50 border border-slate-400 text-slate-900 text-xs font-medium rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">

              {/* SECTION 1: Personal Information */}
              <div className="space-y-2.5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Rahul Sharma"
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="rahul@example.com"
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      required
                      placeholder="9876543210"
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-600 transition-all"
                    />
                  </div>

                  {/* Password Field with Original Eye Toggle */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
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
                </div>
              </div>

              {/* SECTION 2: Binary Placement Info */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Placement & Sponsor Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Parent Agent ID <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="parentAgentId"
                      value={formData.parentAgentId}
                      onChange={handleChange}
                      placeholder="e.g. AGT1001"
                      className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Placement Side
                    </label>
                    <div className="grid grid-cols-2 gap-1 p-1 bg-white border border-slate-200 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setPosition("left")}
                        className={`py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                          position === "left"
                            ? "bg-slate-800 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Left Slot
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosition("right")}
                        className={`py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                          position === "right"
                            ? "bg-slate-800 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Right Slot
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Identity Documents (KYC Photo Uploads) */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Identity Verification Documents (KYC)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* PAN Card Photo Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      PAN Card Photo *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="panCardImage"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        className="w-full px-2 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                      />
                    </div>
                    {formData.panCardImage && (
                      <p className="text-[10px] text-emerald-600 mt-1 font-medium">✓ PAN Image Selected</p>
                    )}
                  </div>

                  {/* Aadhaar Card Photo Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Aadhaar Card Photo *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="adharCardImage"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        className="w-full px-2 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                      />
                    </div>
                    {formData.adharCardImage && (
                      <p className="text-[10px] text-emerald-600 mt-1 font-medium">✓ Aadhaar Image Selected</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {loading ? "Uploading & Registering..." : "Complete Registration →"}
              </button>

              {/* Navigation Link */}
              <p className="text-center text-xs text-slate-500 mt-2">
                Already registered?{" "}
                <a href="/login" className="text-slate-800 font-semibold hover:underline">
                  Sign In to Dashboard
                </a>
              </p>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;