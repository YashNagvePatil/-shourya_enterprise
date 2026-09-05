import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFranchiseProfile } from "../hooks/useFranchiseProfile";
import {
  User,
  Store,
  Building2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Edit3,
  ShieldCheck,
  CreditCard,
  Percent,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Save,
} from "lucide-react";

const FranchiseProfile = () => {
  const {
    profile,
    isProfileLoading,
    isUpdatingProfile,
    isChangingPassword,
    profileError,
    updateError,
    passwordError,
    updateSuccess,
    passwordSuccess,
    fetchProfile,
    updateProfile,
    changePassword,
    clearFlags,
  } = useFranchiseProfile();

  // Active tab state
  const [activeTab, setActiveTab] = useState("overview");

  // Local Form States
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    outletName: "",
    outletAddress: "",
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      accountHolderName: "",
    },
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [pwdMatchError, setPwdMatchError] = useState("");

  // Fetch initial profile
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.personalInfo?.fullName || "",
        phone: profile.personalInfo?.phone || "",
        outletName: profile.outletInfo?.outletName || "",
        outletAddress: profile.outletInfo?.outletAddress || "",
        bankDetails: {
          accountNumber: profile.bankDetails?.accountNumber || "",
          ifscCode: profile.bankDetails?.ifscCode || "",
          bankName: profile.bankDetails?.bankName || "",
          accountHolderName: profile.bankDetails?.accountHolderName || "",
        },
      });
    }
  }, [profile]);

  // Clear toast status flags after 4 seconds
  useEffect(() => {
    if (updateSuccess || passwordSuccess) {
      const timer = setTimeout(() => {
        clearFlags();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess, passwordSuccess, clearFlags]);

  // Profile Form Change Handler
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("bank_")) {
      const field = name.replace("bank_", "");
      setProfileForm((prev) => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [field]: value,
        },
      }));
    } else {
      setProfileForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Profile Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(profileForm);
  };

  // Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdMatchError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwdMatchError("New passwords do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPwdMatchError("Password must be at least 8 characters long.");
      return;
    }

    const res = await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    if (res.success) {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  if (isProfileLoading && !profile) {
    return (
      <div className="min-h-screen bg-[#FAF5EF] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-10 h-10 text-[#D8234A] animate-spin" />
          <p className="text-stone-500 font-light tracking-wide text-sm">
            Loading Franchise Partner Details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF5EF] text-stone-700 font-light p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back to Dashboard Navigation Button */}
        <div>
          <Link
            to="/franchise/dashboard"
            className="inline-flex items-center gap-2 text-xs font-normal text-stone-600 hover:text-[#D8234A] bg-white border border-stone-200/80 px-3.5 py-2 rounded-xl shadow-xs transition hover:bg-stone-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
        </div>
        
        {/* Alerts / Banner Notifications */}
        {updateSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-light flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Profile and details updated successfully!</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-light flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Security password changed successfully!</span>
          </div>
        )}

        {(profileError || updateError) && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-[#D8234A] text-sm font-light flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-[#D8234A] flex-shrink-0" />
            <span>{profileError || updateError}</span>
          </div>
        )}

        {/* ---------------- HEADER CARD (Red/Amber Accent) ---------------- */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#D8234A] via-[#E65C00] to-[#F59E38] p-6 md:p-8 text-white shadow-lg">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            
            <div className="flex items-center space-x-5">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-extralight text-white border border-white/30 shadow-inner">
                {profile?.personalInfo?.fullName?.charAt(0) || "F"}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl md:text-3xl font-light tracking-wide">
                    {profile?.personalInfo?.fullName || "Franchise Partner"}
                  </h1>
                  <span className="px-3 py-0.5 text-xs font-light tracking-widest uppercase rounded-full bg-white/20 border border-white/30 backdrop-blur-sm">
                    {profile?.outletInfo?.status || "ACTIVE"}
                  </span>
                </div>
                <p className="text-white/80 text-sm font-extralight flex items-center space-x-2">
                  <Store className="w-4 h-4 inline" />
                  <span>{profile?.outletInfo?.outletName || "Primary Store Outlet"}</span>
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex items-center justify-around md:justify-end gap-6 text-center md:text-right">
              <div>
                <span className="block text-xs uppercase tracking-wider text-white/70 font-extralight">
                  Franchise Tier
                </span>
                <span className="text-lg font-light tracking-wide text-amber-200">
                  {profile?.planBenefits?.typeName || "Standard"}
                </span>
              </div>
              <div className="h-8 w-[1px] bg-white/20"></div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-white/70 font-extralight">
                  Bank Status
                </span>
                <span className="text-sm font-light flex items-center justify-center md:justify-end space-x-1 mt-0.5">
                  {profile?.checks?.isBankConfigured ? (
                    <span className="text-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Verified
                    </span>
                  ) : (
                    <span className="text-amber-200 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Pending
                    </span>
                  )}
                </span>
              </div>
            </div>

          </div>

          {/* Background Decorative Circles */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* ---------------- NAVIGATION TABS ---------------- */}
        <div className="flex space-x-2 border-b border-stone-200 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-2.5 text-sm font-light rounded-t-xl transition-all duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-white text-[#D8234A] border-t-2 border-[#D8234A] shadow-sm"
                : "text-stone-500 hover:text-stone-800 hover:bg-white/50"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Overview & Benefits</span>
          </button>

          <button
            onClick={() => setActiveTab("edit")}
            className={`px-5 py-2.5 text-sm font-light rounded-t-xl transition-all duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "edit"
                ? "bg-white text-[#D8234A] border-t-2 border-[#D8234A] shadow-sm"
                : "text-stone-500 hover:text-stone-800 hover:bg-white/50"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile & Bank Details</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`px-5 py-2.5 text-sm font-light rounded-t-xl transition-all duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "security"
                ? "bg-white text-[#D8234A] border-t-2 border-[#D8234A] shadow-sm"
                : "text-stone-500 hover:text-stone-800 hover:bg-white/50"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* ---------------- TAB 1: OVERVIEW & BENEFITS ---------------- */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Benefits Cards */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm hover:border-[#F59E38] transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-extralight">
                    Monthly ROI
                  </span>
                  <div className="p-2 rounded-lg bg-amber-50 text-[#F59E38]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-light text-stone-800 mt-2">
                  ₹{profile?.planBenefits?.monthlyRoi?.toLocaleString() || 0}
                </p>
                <span className="text-xs text-stone-400 font-extralight">Assured Monthly Returns</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm hover:border-[#F59E38] transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-extralight">
                    Monthly Rent Support
                  </span>
                  <div className="p-2 rounded-lg bg-rose-50 text-[#D8234A]">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-light text-stone-800 mt-2">
                  ₹{profile?.planBenefits?.monthlyRent?.toLocaleString() || 0}
                </p>
                <span className="text-xs text-stone-400 font-extralight">Store Space Allowance</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm hover:border-[#F59E38] transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-extralight">
                    Commission Rate
                  </span>
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <Percent className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-light text-stone-800 mt-2">
                  {profile?.planBenefits?.commission?.percent || 0}% / Item
                </p>
                <span className="text-xs text-stone-400 font-extralight">
                  ₹{profile?.planBenefits?.commission?.perProduct || 0} base per sale
                </span>
              </div>
            </div>

            {/* Personal Info Box */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-light text-stone-800 border-b pb-2 flex items-center space-x-2">
                <User className="w-4 h-4 text-[#D8234A]" />
                <span>Personal Information</span>
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-stone-400 block font-extralight">Full Name</span>
                  <span className="text-stone-700">{profile?.personalInfo?.fullName || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-stone-400 block font-extralight">Email Address</span>
                  <span className="text-stone-700 flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-stone-400 inline mr-1" />
                    {profile?.personalInfo?.email || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-400 block font-extralight">Phone Number</span>
                  <span className="text-stone-700 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-stone-400 inline mr-1" />
                    {profile?.personalInfo?.phone || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Outlet Details */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-light text-stone-800 border-b pb-2 flex items-center space-x-2">
                <Store className="w-4 h-4 text-[#F59E38]" />
                <span>Outlet Details</span>
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-stone-400 block font-extralight">Outlet Name</span>
                  <span className="text-stone-700 font-normal">{profile?.outletInfo?.outletName || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-stone-400 block font-extralight">Address</span>
                  <span className="text-stone-700 flex items-start space-x-1 mt-0.5">
                    <MapPin className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5 mr-1" />
                    {profile?.outletInfo?.outletAddress || "Address details not updated"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-400 block font-extralight">Status</span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-light text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200">
                    {profile?.outletInfo?.status || "ACTIVE"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Accounts Overview */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-light text-stone-800 border-b pb-2 flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>Payout Bank Details</span>
              </h3>

              {profile?.bankDetails?.accountNumber ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-stone-400 block font-extralight">Bank Name</span>
                    <span className="text-stone-700 font-normal">{profile.bankDetails.bankName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-stone-400 block font-extralight">Account Number</span>
                    <span className="text-stone-700 font-mono tracking-wider">
                      •••• •••• {profile.bankDetails.accountNumber.slice(-4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-stone-400 block font-extralight">IFSC Code</span>
                    <span className="text-stone-700 font-mono">{profile.bankDetails.ifscCode || "—"}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 text-center space-y-2">
                  <p className="text-xs text-amber-800 font-light">Bank account for payouts is missing.</p>
                  <button
                    onClick={() => setActiveTab("edit")}
                    className="text-xs text-[#D8234A] underline font-normal"
                  >
                    Configure Bank Details Now
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ---------------- TAB 2: EDIT PROFILE & BANK DETAILS ---------------- */}
        {activeTab === "edit" && (
          <form onSubmit={handleProfileSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-8">
            
            {/* Personal & Store Section */}
            <div className="space-y-4">
              <h3 className="text-base font-light text-stone-800 border-b pb-2 flex items-center space-x-2">
                <User className="w-4 h-4 text-[#D8234A]" />
                <span>Update General Information</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-stone-500 font-extralight mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileForm.fullName}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-light focus:outline-none focus:border-[#D8234A] transition"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-500 font-extralight mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-light focus:outline-none focus:border-[#D8234A] transition"
                    placeholder="Enter contact number"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-500 font-extralight mb-1">Outlet Store Name</label>
                  <input
                    type="text"
                    name="outletName"
                    value={profileForm.outletName}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-light focus:outline-none focus:border-[#D8234A] transition"
                    placeholder="Outlet Name"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-500 font-extralight mb-1">Outlet Address</label>
                  <input
                    type="text"
                    name="outletAddress"
                    value={profileForm.outletAddress}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-light focus:outline-none focus:border-[#D8234A] transition"
                    placeholder="Full physical address"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <h3 className="text-base font-light text-stone-800 border-b pb-2 flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-[#F59E38]" />
                <span>Bank Account Information (Payout Settlements)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-stone-500 font-extralight mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    name="bank_accountHolderName"
                    value={profileForm.bankDetails.accountHolderName}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-light focus:outline-none focus:border-[#F59E38] transition"
                    placeholder="Name as in bank"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-500 font-extralight mb-1">Bank Name</label>
                  <input
                    type="text"
                    name="bank_bankName"
                    value={profileForm.bankDetails.bankName}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-light focus:outline-none focus:border-[#F59E38] transition"
                    placeholder="e.g. HDFC Bank"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-500 font-extralight mb-1">Account Number</label>
                  <input
                    type="text"
                    name="bank_accountNumber"
                    value={profileForm.bankDetails.accountNumber}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-light focus:outline-none focus:border-[#F59E38] transition font-mono"
                    placeholder="Account Number"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-500 font-extralight mb-1">IFSC Code</label>
                  <input
                    type="text"
                    name="bank_ifscCode"
                    value={profileForm.bankDetails.ifscCode}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-light focus:outline-none focus:border-[#F59E38] transition uppercase font-mono"
                    placeholder="e.g. HDFC0001234"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="px-6 py-2.5 rounded-xl bg-[#D8234A] hover:bg-[#b81b3c] text-white text-sm font-light tracking-wide shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ---------------- TAB 3: SECURITY & PASSWORD ---------------- */}
        {activeTab === "security" && (
          <form onSubmit={handlePasswordSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200/80 shadow-sm max-w-xl space-y-5">
            <h3 className="text-base font-light text-stone-800 border-b pb-2 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-[#D8234A]" />
              <span>Change Password</span>
            </h3>

            {pwdMatchError && (
              <div className="p-3 rounded-lg bg-rose-50 text-[#D8234A] text-xs font-light">
                {pwdMatchError}
              </div>
            )}

            {passwordError && (
              <div className="p-3 rounded-lg bg-rose-50 text-[#D8234A] text-xs font-light">
                {passwordError}
              </div>
            )}

            <div>
              <label className="block text-xs text-stone-500 font-extralight mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-light focus:outline-none focus:border-[#D8234A] transition"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-500 font-extralight mb-1">New Password (Min 8 chars)</label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-light focus:outline-none focus:border-[#D8234A] transition"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-500 font-extralight mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-light focus:outline-none focus:border-[#D8234A] transition"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-2.5 rounded-xl bg-[#D8234A] hover:bg-[#b81b3c] text-white text-sm font-light tracking-wide shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default FranchiseProfile;