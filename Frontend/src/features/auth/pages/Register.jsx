import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth.js";

const initialFormData = {
  fullName: "",
  email: "",
  contact: "",
  password: "",
  role: "Agent",
  panCardImage: "",
  adharCardImage: "",
  parentAgentId: "",
  parentAgentName: "", // Fixed typo: parrentAgentName -> parentAgentName
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { handleRegister, loading, error } = useAuth();

  const [position, setPosition] = useState("left");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.panCardImage || !formData.adharCardImage) {
      alert("Please upload both PAN and Aadhaar Card images.");
      return;
    }

    // Clean payload constructed explicitly
    const payload = {
      ...formData,
      position,
    };

    const res = await handleRegister(payload);

    if (res?.success) {
      alert("Registration Successful!");
      setFormData(initialFormData);
      setPosition("left");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-50 font-light text-slate-600 antialiased selection:bg-amber-100 selection:text-amber-800">
      {/* Left Branding Sidebar */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] tracking-widest uppercase font-light">
            Distributor Network
          </span>
          <h1 className="text-3xl font-extralight tracking-wide mt-4 uppercase">
            Smart Appliances Network
          </h1>
        </div>

        <div className="space-y-4 relative z-10">
          <h2 className="text-4xl font-extralight leading-tight">
            Build Your Business with Next-Gen Home Appliances.
          </h2>
          <p className="text-amber-100/80 text-xs font-light leading-relaxed max-w-md">
            Premium kitchen & living appliances with transparent growth tracking and real-time network commissions.
          </p>
        </div>

        <div className="text-[11px] text-amber-200/60 font-light tracking-wide relative z-10">
          Enterprise Logistics v2.4
        </div>
      </div>

      {/* Right Form Container */}
      <div className="w-full lg:w-7/12 p-6 sm:p-10 md:p-14 overflow-y-auto max-h-screen bg-white">
        <div className="max-w-xl mx-auto space-y-8">
          
          {/* Header */}
          <div>
            <h2 className="text-2xl font-light text-slate-800 tracking-tight">
              Create Distributor Account
            </h2>
            <p className="text-xs font-light text-slate-400 mt-1">
              Fill in your registration details to join the agent network.
            </p>
          </div>

          {/* Franchise Navigation Card */}
          <div className="p-4 bg-stone-50/60 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-normal text-slate-700">Looking to open a Franchise?</p>
              <p className="text-[11px] font-light text-slate-400">Apply for a regional franchise account instead.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/registerFranchise")}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-light text-xs rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              Franchise Registration →
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 text-xs font-light bg-red-50/80 text-red-600 border border-red-100 rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <h3 className="text-xs font-normal uppercase tracking-wider text-slate-500">
                  1. Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Full Name *"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-3 bg-stone-50/50 border border-slate-200/80 rounded-lg text-xs font-light focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-slate-400"
                />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 bg-stone-50/50 border border-slate-200/80 rounded-lg text-xs font-light focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-slate-400"
                />
                <input
                  type="tel"
                  name="contact"
                  required
                  placeholder="Mobile Number *"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full p-3 bg-stone-50/50 border border-slate-200/80 rounded-lg text-xs font-light focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-slate-400"
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Password *"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-3 bg-stone-50/50 border border-slate-200/80 rounded-lg text-xs font-light focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-slate-400 pr-9"
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
              </div>
            </div>

            {/* 2. Placement Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <h3 className="text-xs font-normal uppercase tracking-wider text-slate-500">
                  2. Placement & Sponsor Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <input
                  type="text"
                  name="parentAgentId"
                  placeholder="Parent Agent ID (Optional)"
                  value={formData.parentAgentId}
                  onChange={handleChange}
                  className="p-3 bg-stone-50/50 border border-slate-200/80 rounded-lg text-xs font-light focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-slate-400"
                />

                <div className="grid grid-cols-2 gap-1 p-1 bg-stone-50/50 border border-slate-200/80 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPosition("left")}
                    className={`py-2 text-xs font-light rounded transition-all cursor-pointer ${
                      position === "left"
                        ? "bg-amber-500 text-white shadow-sm font-normal"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Left Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosition("right")}
                    className={`py-2 text-xs font-light rounded transition-all cursor-pointer ${
                      position === "right"
                        ? "bg-amber-500 text-white shadow-sm font-normal"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Right Slot
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Identity Documents */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <h3 className="text-xs font-normal uppercase tracking-wider text-slate-500">
                  3. Identity Verification Documents (KYC)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5 p-3 bg-stone-50/40 border border-slate-200/70 rounded-lg">
                  <label className="text-[11px] font-light text-slate-500">PAN Card Photo *</label>
                  <input
                    type="file"
                    name="panCardImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="text-[11px] font-light file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-light file:bg-amber-100/80 file:text-amber-800 hover:file:bg-amber-200/80 cursor-pointer text-slate-400"
                  />
                  {formData.panCardImage && (
                    <span className="text-[10px] text-emerald-600 font-light">✓ PAN Image Selected</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 p-3 bg-stone-50/40 border border-slate-200/70 rounded-lg">
                  <label className="text-[11px] font-light text-slate-500">Aadhaar Card Photo *</label>
                  <input
                    type="file"
                    name="adharCardImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="text-[11px] font-light file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-light file:bg-amber-100/80 file:text-amber-800 hover:file:bg-amber-200/80 cursor-pointer text-slate-400"
                  />
                  {formData.adharCardImage && (
                    <span className="text-[10px] text-emerald-600 font-light">✓ Aadhaar Image Selected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-lg text-xs font-normal tracking-wide shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Uploading & Registering..." : "Complete Registration →"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <p className="text-xs font-light text-slate-400">
              Already registered?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-amber-600 hover:underline font-normal inline-block ml-1 cursor-pointer focus:outline-none"
              >
                Sign In to Dashboard
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;