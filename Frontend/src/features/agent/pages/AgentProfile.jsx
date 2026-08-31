import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  ShieldCheck,
  Building2,
  MapPin,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  UploadCloud,
  FileText,
  Save,
  Lock,
} from "lucide-react";
import { useAgentProfile } from "../hook/useAgentProfile"; // Adjust path as needed

const AgentProfile = () => {
  const navigate = useNavigate();
  const {
    profileData,
    kycData,
    bankDetails,
    address,
    isLoading,
    isUpdating,
    error,
    successMessage,
    fetchProfile,
    updateProfile,
    submitKYC,
    updateBank,
    resetMessages,
  } = useAgentProfile();

  // Active Tab State ('personal' | 'kyc' | 'bank')
  const [activeTab, setActiveTab] = useState("personal");

  // Local Form States
  const [personalForm, setPersonalForm] = useState({
    fullName: "",
    contact: "",
  });

  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [bankForm, setBankForm] = useState({
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    accountHolderName: "",
    upiId: "",
  });

  const [kycForm, setKycForm] = useState({
    panCardImage: "",
    adharCardImage: "",
  });

  // Load Profile on Mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Sync Redux States with Local Form Inputs
  useEffect(() => {
    if (profileData) {
      setPersonalForm({
        fullName: profileData.fullName || "",
        contact: profileData.contact || "",
      });
    }
    if (address) {
      setAddressForm({
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
      });
    }
    if (bankDetails) {
      setBankForm({
        accountNumber: bankDetails.accountNumber || "",
        ifscCode: bankDetails.ifscCode || "",
        bankName: bankDetails.bankName || "",
        accountHolderName: bankDetails.accountHolderName || "",
        upiId: bankDetails.upiId || "",
      });
    }
    if (kycData) {
      setKycForm({
        panCardImage: kycData.panCardImage || "",
        adharCardImage: kycData.adharCardImage || "",
      });
    }
  }, [profileData, address, bankDetails, kycData]);

  // Auto Reset Toast Messages after 4 Seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        resetMessages();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, resetMessages]);

  // Form Submit Handlers
  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({
      ...personalForm,
      address: addressForm,
    });
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    await updateBank(bankForm);
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    await submitKYC(kycForm);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#FAF5EE] space-y-3">
        <Loader2 className="w-9 h-9 text-[#DC2643] animate-spin" />
        <p className="text-xs font-light text-[#2A1815]/70 tracking-widest uppercase">
          Fetching Agent Profile Settings...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF5EE] p-4 sm:p-6 font-sans text-[#2A1815] select-none">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER BAR */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/agent/dashboard")}
              className="p-2.5 bg-[#2A1815] text-[#FAF5EE] hover:bg-[#DC2643] rounded-xl transition-colors duration-200 cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#2A1815] tracking-tight">Agent Account Settings</h1>
              <p className="text-xs text-[#2A1815]/70 font-light">Manage your identity, address, KYC documents and bank info.</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 bg-[#2A1815] text-[#FAF5EE] border border-[#D6B265]/40 rounded-xl p-2 px-3.5 text-xs">
            <span className="text-[#FAF5EE]/60">Distributor ID:</span>
            <strong className="font-mono text-[#F59E35]">{profileData?.distributerId || "N/A"}</strong>
          </div>
        </div>

        {/* GLOBAL TOAST ALERTS */}
        {successMessage && (
          <div className="bg-emerald-900/10 border border-emerald-500/30 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center space-x-2 shadow-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="bg-[#DC2643]/10 border border-[#DC2643]/30 text-[#DC2643] px-4 py-3 rounded-xl text-xs flex items-center space-x-2 shadow-xs animate-fade-in">
            <AlertCircle className="w-4 h-4 text-[#DC2643] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PROFILE OVERVIEW CARD */}
        <div className="bg-[#2A1815] text-[#FAF5EE] border border-[#D6B265]/30 rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-[#DC2643] text-[#FAF5EE] flex items-center justify-center font-bold text-xl border-2 border-[#D6B265]/50 shadow-inner">
              {profileData?.fullName?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-[#FAF5EE]">{profileData?.fullName}</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold tracking-wide bg-[#F59E35] text-[#2A1815]">
                  {profileData?.rank || "Distributor"}
                </span>
              </div>
              <p className="text-xs text-[#FAF5EE]/70 font-mono mt-0.5">{profileData?.email}</p>
              <p className="text-xs text-[#FAF5EE]/50 font-mono mt-0.5">+91 {profileData?.contact}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto relative z-10 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 px-4 text-center flex-1 md:flex-initial">
              <span className="text-[10px] text-[#FAF5EE]/60 block uppercase tracking-wider">Account Status</span>
              <span className={`text-xs font-semibold ${profileData?.isActivated ? "text-emerald-400" : "text-[#F59E35]"}`}>
                {profileData?.isActivated ? "Activated" : "Pending Activation"}
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 px-4 text-center flex-1 md:flex-initial">
              <span className="text-[10px] text-[#FAF5EE]/60 block uppercase tracking-wider">KYC Verification</span>
              <span className={`text-xs font-semibold ${
                kycData?.kycStatus === "Approved" ? "text-emerald-400" :
                kycData?.kycStatus === "Rejected" ? "text-[#DC2643]" : "text-[#D6B265]"
              }`}>
                {kycData?.kycStatus || "Not Submitted"}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN SETTINGS TABS CONTAINER */}
        <div className="bg-white border border-[#D6B265]/30 rounded-2xl p-6 shadow-sm">
          
          {/* TABS NAVIGATION */}
          <div className="flex items-center space-x-2 border-b border-[#D6B265]/20 pb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("personal")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === "personal"
                  ? "bg-[#2A1815] text-[#FAF5EE] shadow-sm"
                  : "text-[#2A1815]/70 hover:bg-[#FAF5EE]"
              }`}
            >
              <User className="w-4 h-4 text-[#F59E35]" />
              <span>Personal & Address</span>
            </button>

            <button
              onClick={() => setActiveTab("bank")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === "bank"
                  ? "bg-[#2A1815] text-[#FAF5EE] shadow-sm"
                  : "text-[#2A1815]/70 hover:bg-[#FAF5EE]"
              }`}
            >
              <CreditCard className="w-4 h-4 text-[#DC2643]" />
              <span>Bank & Payout Details</span>
            </button>

            <button
              onClick={() => setActiveTab("kyc")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === "kyc"
                  ? "bg-[#2A1815] text-[#FAF5EE] shadow-sm"
                  : "text-[#2A1815]/70 hover:bg-[#FAF5EE]"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#D6B265]" />
              <span>KYC Documents</span>
            </button>
          </div>

          {/* TAB 1: PERSONAL & ADDRESS DETAILS */}
          {activeTab === "personal" && (
            <form onSubmit={handlePersonalSubmit} className="mt-6 space-y-6">
              
              {/* Personal Info Group */}
              <div>
                <h3 className="text-xs font-bold text-[#2A1815] uppercase tracking-wider mb-3 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1.5 text-[#DC2643]" /> Basic Personal Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-medium text-[#2A1815]/70 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={personalForm.fullName}
                      onChange={(e) => setPersonalForm({ ...personalForm, fullName: e.target.value })}
                      required
                      className="w-full bg-[#FAF5EE] border border-[#D6B265]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#2A1815] focus:outline-none focus:border-[#2A1815] transition-colors"
                      placeholder="Your full registered name"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#2A1815]/70 block mb-1">Mobile Contact</label>
                    <input
                      type="number"
                      value={personalForm.contact}
                      onChange={(e) => setPersonalForm({ ...personalForm, contact: e.target.value })}
                      required
                      className="w-full bg-[#FAF5EE] border border-[#D6B265]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#2A1815] focus:outline-none focus:border-[#2A1815] transition-colors font-mono"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address Group */}
              <div className="pt-4 border-t border-[#D6B265]/20">
                <h3 className="text-xs font-bold text-[#2A1815] uppercase tracking-wider mb-3 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#DC2643]" /> Shipping Address Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-medium text-[#2A1815]/70 block mb-1">Street Address</label>
                    <input
                      type="text"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      className="w-full bg-[#FAF5EE] border border-[#D6B265]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#2A1815] focus:outline-none focus:border-[#2A1815] transition-colors"
                      placeholder="House No, Street name, Landmark"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#2A1815]/70 block mb-1">City</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full bg-[#FAF5EE] border border-[#D6B265]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#2A1815] focus:outline-none focus:border-[#2A1815] transition-colors"
                      placeholder="City Name"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#2A1815]/70 block mb-1">State</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full bg-[#FAF5EE] border border-[#D6B265]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#2A1815] focus:outline-none focus:border-[#2A1815] transition-colors"
                      placeholder="State Name"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#2A1815]/70 block mb-1">Pincode</label>
                    <input
                      type="text"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      className="w-full bg-[#FAF5EE] border border-[#D6B265]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#2A1815] focus:outline-none focus:border-[#2A1815] transition-colors font-mono"
                      placeholder="6-Digit Area Code"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-[#DC2643] text-[#FAF5EE] hover:bg-[#2A1815] px-6 py-2.5 rounded-xl text-xs font-medium transition-colors duration-200 flex items-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#FAF5EE]" />}
                  <span>Save Personal Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: BANK & PAYOUT DETAILS */}
          {activeTab === "bank" && (
            <form onSubmit={handleBankSubmit} className="mt-6 space-y-4">
              <h3 className="text-xs font-bold text-[#2A1815] uppercase tracking-wider mb-3 flex items-center">
                <Building2 className="w-3.5 h-3.5 mr-1.5 text-[#DC2643]" /> Withdrawal & Bank Account Info
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-[#2A1815]/70 block mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={bankForm.accountHolderName}
                    onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                    className="w-full bg-[#FAF5EE] border border-[#D6B265]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#2A1815] focus:outline-none focus:border-[#2A1815] transition-colors"
                    placeholder="Name as in Bank Passbook"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#2A1815]/70 block mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    className="w-full bg-[#FAF5EE] border border-[#D6B265]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#2A1815] focus:outline-none focus:border-[#2A1815] transition-colors"
                    placeholder="e.g. HDFC Bank, SBI"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#2A1815]/70 block mb-1">Account Number</label>
                  <input
                    type="text"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    className="w-full bg-[#FAF5EE] border border-[#D6B265]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#2A1815] focus:outline-none focus:border-[#2A1815] transition-colors font-mono"
                    placeholder="Bank Account Number"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#2A1815]/70 block mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                    className="w-full bg-[#FAF5EE] border border-[#D6B265]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#2A1815] focus:outline-none focus:border-[#2A1815] transition-colors font-mono uppercase"
                    placeholder="11 Character IFSC Code"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-[#2A1815]/70 block mb-1">UPI ID (Optional)</label>
                  <input
                    type="text"
                    value={bankForm.upiId}
                    onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                    className="w-full bg-[#FAF5EE] border border-[#D6B265]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#2A1815] focus:outline-none focus:border-[#2A1815] transition-colors font-mono"
                    placeholder="username@upi / mobile@paytm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-[#DC2643] text-[#FAF5EE] hover:bg-[#2A1815] px-6 py-2.5 rounded-xl text-xs font-medium transition-colors duration-200 flex items-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#FAF5EE]" />}
                  <span>Update Bank Details</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: KYC DOCUMENTS */}
          {activeTab === "kyc" && (
            <form onSubmit={handleKycSubmit} className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#2A1815] uppercase tracking-wider flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-[#DC2643]" /> Submit Verification Documents
                </h3>
                {kycData?.kycStatus === "Approved" && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full font-medium flex items-center">
                    <Lock className="w-3 h-3 mr-1" /> Approved & Locked
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PAN Card Input */}
                <div className="bg-[#FAF5EE] border border-[#D6B265]/40 rounded-xl p-4">
                  <label className="text-[11px] font-semibold text-[#2A1815] block mb-1">PAN Card Image URL</label>
                  <p className="text-[10px] text-[#2A1815]/60 mb-2">Cloudinary URL for your uploaded PAN card</p>
                  <input
                    type="text"
                    value={kycForm.panCardImage}
                    onChange={(e) => setKycForm({ ...kycForm, panCardImage: e.target.value })}
                    disabled={kycData?.kycStatus === "Approved"}
                    className="w-full bg-white border border-[#D6B265]/40 rounded-xl px-3 py-2 text-xs text-[#2A1815] focus:outline-none focus:border-[#2A1815] disabled:opacity-60 font-mono"
                    placeholder="https://res.cloudinary.com/..."
                  />
                </div>

                {/* Aadhaar Card Input */}
                <div className="bg-[#FAF5EE] border border-[#D6B265]/40 rounded-xl p-4">
                  <label className="text-[11px] font-semibold text-[#2A1815] block mb-1">Aadhaar Card Image URL</label>
                  <p className="text-[10px] text-[#2A1815]/60 mb-2">Cloudinary URL for your uploaded Aadhaar card</p>
                  <input
                    type="text"
                    value={kycForm.adharCardImage}
                    onChange={(e) => setKycForm({ ...kycForm, adharCardImage: e.target.value })}
                    disabled={kycData?.kycStatus === "Approved"}
                    className="w-full bg-white border border-[#D6B265]/40 rounded-xl px-3 py-2 text-xs text-[#2A1815] focus:outline-none focus:border-[#2A1815] disabled:opacity-60 font-mono"
                    placeholder="https://res.cloudinary.com/..."
                  />
                </div>
              </div>

              {kycData?.kycStatus !== "Approved" && (
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-[#DC2643] text-[#FAF5EE] hover:bg-[#2A1815] px-6 py-2.5 rounded-xl text-xs font-medium transition-colors duration-200 flex items-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4 text-[#FAF5EE]" />}
                    <span>Submit KYC for Verification</span>
                  </button>
                </div>
              )}
            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default AgentProfile;