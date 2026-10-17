import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hook/useAuth.js";
import { getSponsorDetailsApi } from "../service/auth.api.js";

const initialFormData = {
  fullName: "",
  email: "",
  contact: "",
  password: "",
  role: "Agent",
  panCardImage: "",
  adharCardImage: "",
  parentAgentId: "",
  parentAgentName: "",
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleRegister, loading, error } = useAuth();

  const [position, setPosition] = useState("left");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  // Sponsor Auto-Lookup State
  const [sponsorInfo, setSponsorInfo] = useState({
    loading: false,
    data: null,
    error: null,
  });

  // Registration Success Modal State
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    agentId: "",
    email: "",
    fullName: "",
    copied: false,
  });


  // Helper to parse pasted referral URLs or raw Sponsor Agent IDs
  const parseSponsorInput = (rawInput) => {
    if (!rawInput) return { sponsorId: "", position: null };
    const trimmed = rawInput.trim();

    // 1. Try URL search parameters or path parsing
    if (trimmed.includes("?") || trimmed.includes("http://") || trimmed.includes("https://")) {
      try {
        const dummyUrl = trimmed.startsWith("http")
          ? trimmed
          : `http://dummy.com/${trimmed.startsWith("/") ? trimmed.slice(1) : trimmed}`;
        const urlObj = new URL(dummyUrl);
        const params = urlObj.searchParams;

        const extractedId =
          params.get("parentAgentId") ||
          params.get("sponsorId") ||
          params.get("ref") ||
          params.get("sponsor") ||
          "";

        const extractedPos = params.get("position") || params.get("leg") || "";

        let finalPos = null;
        if (
          extractedPos &&
          (extractedPos.toLowerCase() === "left" ||
            extractedPos.toLowerCase() === "right")
        ) {
          finalPos = extractedPos.toLowerCase();
        }

        if (extractedId) {
          return { sponsorId: extractedId, position: finalPos };
        }

        // If URL path contains agent ID (e.g., /register/AGT535115)
        const pathSegments = urlObj.pathname.split("/").filter(Boolean);
        const lastSegment = pathSegments[pathSegments.length - 1];
        if (lastSegment && (lastSegment.toUpperCase().startsWith("AGT") || lastSegment.length >= 6)) {
          return { sponsorId: lastSegment, position: finalPos };
        }
      } catch (err) {
        console.warn("Referral link parse notice:", err);
      }
    }

    // 2. Try regex extraction for key=val (e.g., parentAgentId=AGT535115&position=left)
    const matchKeyVal = trimmed.match(/(?:parentAgentId|sponsorId|ref|sponsor)=([A-Za-z0-9_]+)/i);
    if (matchKeyVal && matchKeyVal[1]) {
      const matchLeg = trimmed.match(/(?:position|leg)=(left|right)/i);
      return {
        sponsorId: matchKeyVal[1],
        position: matchLeg ? matchLeg[1].toLowerCase() : null,
      };
    }

    return { sponsorId: trimmed, position: null };
  };


  // URL search parameter handler on component mount
  useEffect(() => {
    const rawSponsorParam =
      searchParams.get("parentAgentId") ||
      searchParams.get("sponsorId") ||
      searchParams.get("ref") ||
      "";
    const positionParam =
      searchParams.get("position") || searchParams.get("leg") || "";

    if (rawSponsorParam) {
      setFormData((prev) => ({
        ...prev,
        parentAgentId: rawSponsorParam,
      }));
    }
    if (
      positionParam &&
      (positionParam.toLowerCase() === "left" ||
        positionParam.toLowerCase() === "right")
    ) {
      setPosition(positionParam.toLowerCase());
    }
  }, [searchParams]);

  // Debounced Effect: Fetch Sponsor Name from backend whenever parentAgentId changes
  useEffect(() => {
    const rawId = formData.parentAgentId?.trim();
    if (!rawId) {
      setSponsorInfo({ loading: false, data: null, error: null });
      setFormData((prev) => ({ ...prev, parentAgentName: "" }));
      return;
    }

    setSponsorInfo({ loading: true, data: null, error: null });

    const timer = setTimeout(async () => {
      try {
        const res = await getSponsorDetailsApi(rawId);
        if (res?.success && res.sponsor) {
          setSponsorInfo({
            loading: false,
            data: res.sponsor,
            error: null,
          });
          setFormData((prev) => ({
            ...prev,
            parentAgentName: res.sponsor.fullName || "System",
          }));
        } else {
          setSponsorInfo({
            loading: false,
            data: null,
            error: "Sponsor not found",
          });
          setFormData((prev) => ({ ...prev, parentAgentName: "" }));
        }
      } catch (err) {
        setSponsorInfo({
          loading: false,
          data: null,
          error: err.message || "Invalid Sponsor ID",
        });
        setFormData((prev) => ({ ...prev, parentAgentName: "" }));
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.parentAgentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "parentAgentId") {
      const { sponsorId, position: extractedPos } = parseSponsorInput(value);
      setFormData((prev) => ({
        ...prev,
        parentAgentId: sponsorId,
      }));
      if (extractedPos) {
        setPosition(extractedPos);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.panCardImage || !formData.adharCardImage) {
      alert("Please upload both PAN and Aadhaar Card images.");
      return;
    }

    if (formData.parentAgentId && sponsorInfo.error) {
      alert("Invalid Sponsor ID! Please provide a valid registered Sponsor Agent ID.");
      return;
    }

    // Explicit Payload Assembly
    const payload = {
      ...formData,
      sponsorId: formData.parentAgentId,
      sponserName: formData.parentAgentName || "System",
      parrentAgentName: formData.parentAgentName || "System",
      position,
    };

    const res = await handleRegister(payload);

    if (res?.success) {
      const generatedAgentId = res?.user?.distributerId || "AGT" + Math.floor(100000 + Math.random() * 900000);
      setSuccessModal({
        isOpen: true,
        agentId: generatedAgentId,
        email: formData.email,
        fullName: formData.fullName,
        copied: false,
      });
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
            {/* 1. Placement & Sponsor Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <h3 className="text-xs font-normal uppercase tracking-wider text-slate-500">
                  1. Placement & Sponsor Details
                </h3>
              </div>

              {/* Sponsor Input & Status */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-light text-slate-500 block">
                      Sponsor Agent ID / Referral Link
                    </label>
                    <input
                      type="text"
                      name="parentAgentId"
                      placeholder="Paste referral link or enter Agent ID..."
                      value={formData.parentAgentId}
                      onChange={handleChange}
                      className="w-full p-3 bg-stone-50/50 border border-slate-200/80 rounded-lg text-xs font-light focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-light text-slate-500 block">
                      Sponsor Name (Auto-Fetched)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="parentAgentName"
                        readOnly
                        placeholder="Auto-pasted Sponsor Name..."
                        value={formData.parentAgentName}
                        className={`w-full p-3 border rounded-lg text-xs font-normal transition-all cursor-not-allowed ${
                          sponsorInfo.data
                            ? "bg-emerald-50/60 border-emerald-200 text-emerald-800"
                            : sponsorInfo.error
                            ? "bg-red-50/60 border-red-200 text-red-700"
                            : "bg-slate-100/70 border-slate-200/80 text-slate-500"
                        }`}
                      />
                      {sponsorInfo.loading && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-amber-600 font-light flex items-center gap-1">
                          <svg className="animate-spin h-3.5 w-3.5 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Fetching...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                {sponsorInfo.data && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-lg text-[11px] font-light">
                    <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Verified Sponsor: <strong className="font-normal">{sponsorInfo.data.fullName}</strong> ({sponsorInfo.data.distributerId})</span>
                  </div>
                )}

                {sponsorInfo.error && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200/60 rounded-lg text-[11px] font-light">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{sponsorInfo.error}</span>
                  </div>
                )}

                {/* Placement Slot Selector */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-light text-slate-500 block">
                    Placement Binary Leg
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-stone-50/60 border border-slate-200/80 rounded-lg max-w-xs">
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
            </div>

            {/* 2. Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <h3 className="text-xs font-normal uppercase tracking-wider text-slate-500">
                  2. Personal Information
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

      {/* Registration Success Modal Popup */}
      {successModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-amber-200/80 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
            
            {/* Decorative Top Accent Bar & Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600" />

            {/* Header Icon & Title */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 bg-amber-100/80 text-amber-600 rounded-full flex items-center justify-center shadow-inner">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-normal text-slate-800 tracking-tight">
                Registration Successful! 🎉
              </h3>
              <p className="text-xs text-slate-500 font-light">
                Welcome to the Network, <span className="font-normal text-slate-700">{successModal.fullName}</span>!
              </p>
            </div>

            {/* Agent ID Highlight Card */}
            <div className="p-4 bg-gradient-to-br from-amber-50 via-stone-50 to-yellow-50 border border-amber-200/80 rounded-xl space-y-2">
              <span className="text-[11px] font-light uppercase tracking-wider text-amber-800/80 block text-center">
                Your Assigned Agent ID
              </span>
              <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-amber-200/70 shadow-sm">
                <span className="text-lg font-mono font-bold tracking-widest text-amber-900">
                  {successModal.agentId}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(successModal.agentId);
                    setSuccessModal((prev) => ({ ...prev, copied: true }));
                    setTimeout(() => {
                      setSuccessModal((prev) => ({ ...prev, copied: false }));
                    }, 2000);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-md text-xs font-light tracking-wide transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  {successModal.copied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy ID
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Safety & Save Note Alert */}
            <div className="p-3.5 bg-amber-500/10 border border-amber-300/40 rounded-xl flex items-start gap-3 text-left">
              <span className="text-base leading-none">📌</span>
              <div className="space-y-1">
                <p className="text-xs font-normal text-amber-900">
                  Important Security Note:
                </p>
                <p className="text-[11px] font-light text-amber-800/90 leading-relaxed">
                  Please copy & save your <strong className="font-normal text-amber-950">Agent ID ({successModal.agentId})</strong> and your <strong className="font-normal text-amber-950">Password</strong> in a safe place. You will need your Agent ID or Email to log in to your account.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => {
                setSuccessModal({ isOpen: false, agentId: "", email: "", fullName: "", copied: false });
                setFormData(initialFormData);
                setPosition("left");
                navigate("/login");
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl text-xs font-normal tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Proceed to Login</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default RegisterPage;