import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { franchiseRegister } from "../service/franchise.api";

const  FranchiseRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobile: "",
    franchiseType: "VILLAGE",
    state: "",
    district: "",
    taluka: "",
    village: "",
    udyamNumber: "",
    panNumber: "",
    aadhaarNumber: "",
    firmDocsUrl: "https://example.com/docs/firm.pdf",
    shopLicenseUrl: "https://example.com/docs/shop.pdf",
    panCardImageUrl: "https://example.com/docs/pan.jpg",
    aadhaarCardImageUrl: "https://example.com/docs/aadhaar.jpg",
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    ifscCode: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      mobile: formData.mobile,
      franchiseType: formData.franchiseType,
      address: {
        state: formData.state,
        district: formData.district,
        taluka: formData.taluka,
        village: formData.village
      },
      udyamNumber: formData.udyamNumber,
      panNumber: formData.panNumber,
      aadhaarNumber: formData.aadhaarNumber,
      firmDocsUrl: formData.firmDocsUrl,
      shopLicenseUrl: formData.shopLicenseUrl,
      panCardImageUrl: formData.panCardImageUrl,
      aadhaarCardImageUrl: formData.aadhaarCardImageUrl,
      bankDetails: {
        accountHolder: formData.accountHolder,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode
      }
    };

    try {
      const res = await franchiseRegister(payload);
      if (res.success) {
        setSuccess("Registration submitted successfully! Pending Admin Verification.");
        setTimeout(() => navigate("/login"), 2500);
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-50 font-light text-slate-700">
      {/* Left Banner */}
      <div className="hidden lg:flex lg:w-1/3 bg-gradient-to-b from-amber-500 to-yellow-600 p-10 text-white flex-col justify-between">
        <div>
          <h1 className="text-2xl font-extralight tracking-widest uppercase">Apex Partner Network</h1>
          <p className="mt-2 text-amber-100 text-xs">Partner Registration Portal</p>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-light">Join Our Growing Enterprise</h2>
          <p className="text-amber-100 text-xs leading-relaxed">
            Register your Village, District, or State franchise location to unlock network supply capabilities.
          </p>
        </div>
        <div className="text-xs text-amber-200">System v2.4</div>
      </div>

      {/* Right Multi-section Form */}
      <div className="w-full lg:w-2/3 p-8 lg:p-12 overflow-y-auto max-h-screen bg-white">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-light text-slate-800">Franchise Onboarding</h2>
            <p className="text-xs text-slate-400 mt-1">Complete your business and compliance details</p>
          </div>

          {error && <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded">{error}</div>}
          {success && <div className="p-3 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Details */}
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xs font-normal uppercase tracking-wider text-amber-600 mb-3">1. Personal & Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="fullName" required placeholder="Full Name" value={formData.fullName} onChange={handleChange} className="p-2.5 bg-stone-50 border border-slate-200 rounded text-xs" />
                <input type="email" name="email" required placeholder="Email Address" value={formData.email} onChange={handleChange} className="p-2.5 bg-stone-50 border border-slate-200 rounded text-xs" />
                <input type="password" name="password" required placeholder="Password" value={formData.password} onChange={handleChange} className="p-2.5 bg-stone-50 border border-slate-200 rounded text-xs" />
                <input type="text" name="mobile" required placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} className="p-2.5 bg-stone-50 border border-slate-200 rounded text-xs" />
                <select name="franchiseType" value={formData.franchiseType} onChange={handleChange} className="p-2.5 bg-stone-50 border border-slate-200 rounded text-xs col-span-2">
                  <option value="VILLAGE">Village Franchise (₹1.5L)</option>
                  <option value="DISTRICT">District Franchise (₹7.5L)</option>
                  <option value="STATE">State Franchise (₹1.5Cr)</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xs font-normal uppercase tracking-wider text-amber-600 mb-3">2. Regional Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="state" required placeholder="State" value={formData.state} onChange={handleChange} className="p-2.5 bg-stone-50 border border-slate-200 rounded text-xs" />
                <input type="text" name="district" required placeholder="District" value={formData.district} onChange={handleChange} className="p-2.5 bg-stone-50 border border-slate-200 rounded text-xs" />
                <input type="text" name="taluka" placeholder="Taluka" value={formData.taluka} onChange={handleChange} className="p-2.5 bg-stone-50 border border-slate-200 rounded text-xs" />
                <input type="text" name="village" placeholder="Village" value={formData.village} onChange={handleChange} className="p-2.5 bg-stone-50 border border-slate-200 rounded text-xs" />
              </div>
            </div>

            {/* Compliance Documents */}
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xs font-normal uppercase tracking-wider text-amber-600 mb-3">3. Business Verification</h3>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="udyamNumber" required placeholder="Udyam Registration No." value={formData.udyamNumber} onChange={handleChange} className="p-2.5 bg-stone-50 border border-slate-200 rounded text-xs" />
                <input type="text" name="panNumber" required placeholder="PAN Number" value={formData.panNumber} onChange={handleChange} className="p-2.5 bg-stone-50 border border-slate-200 rounded text-xs" />
                <input type="text" name="aadhaarNumber" required placeholder="12-digit Aadhaar Number" value={formData.aadhaarNumber} onChange={handleChange} className="p-2.5 bg-stone-50 border border-slate-200 rounded text-xs col-span-2" />
              </div>
            </div>

            {/* Financial Info */}
            <div>
              <h3 className="text-xs font-normal uppercase tracking-wider text-amber-600 mb-3">4. Settlement Bank Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="accountHolder" required placeholder="Account Holder Name" value={formData.accountHolder} onChange={handleChange} className="p-2.5 bg-stone-50 border border-slate-200 rounded text-xs" />
                <input type="text" name="bankName" required placeholder="Bank Name" value={formData.bankName} onChange={handleChange} className="p-2.5 bg-stone-50 border border-slate-200 rounded text-xs" />
                <input type="text" name="accountNumber" required placeholder="Account Number" value={formData.accountNumber} onChange={handleChange} className="p-2.5 bg-stone-50 border border-slate-200 rounded text-xs" />
                <input type="text" name="ifscCode" required placeholder="IFSC Code" value={formData.ifscCode} onChange={handleChange} className="p-2.5 bg-stone-50 border border-slate-200 rounded text-xs" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded text-xs font-normal shadow-sm hover:from-amber-600">
              {loading ? "Submitting Application..." : "Complete Registration"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Already registered? <Link to="/login" className="text-amber-600">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};


export default FranchiseRegister