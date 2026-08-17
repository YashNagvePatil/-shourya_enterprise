import React from "react";
import { useFetchProfile } from "../hook/useAgent"; 
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Award, 
  Lock, 
  CheckCircle,
  Copy,
  Loader2,
  RefreshCw,
  Building2,
  Fingerprint
} from "lucide-react";

// =========================================================================
// DATA MASKING UTILITIES (Standard Formats)
// =========================================================================
const maskEmail = (email) => {
  if (!email) return "N/A";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local}***@${domain}`;
  return `${local.substring(0, 2)}*********@${domain}`;
};

const maskPhone = (phone) => {
  if (!phone) return "N/A";
  const str = phone.toString();
  return `******${str.slice(-4)}`;
};

const maskAddress = (address) => {
  if (!address) return "No address registered";
  
  // If address is an object, try to extract a string representation or handle safely
  let addressStr = typeof address === 'object' 
    ? Object.values(address).filter(Boolean).join(", ") 
    : address.toString();

  if (!addressStr || addressStr.trim() === "") return "No address registered";
  if (addressStr.length <= 12) return `${addressStr.substring(0, 4)}*******`;
  
  return `${addressStr.substring(0, 10)}*********************`;
};

const maskBankAccount = (accNum) => {
  if (!accNum) return "N/A";
  const str = accNum.toString();
  return `********${str.slice(-4)}`;
};

const ProfilePage = () => {
  const { profile, wallet, binaryStats, loading, error, refetchDashboard } = useFetchProfile();

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert(`Copied securely!`);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        <p className="text-xs text-slate-400 mt-2 font-light tracking-wide">Securing connection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white border border-slate-200 p-6 rounded-xl max-w-sm w-full text-center space-y-4 shadow-sm">
          <p className="text-xs text-rose-600 font-medium">{error}</p>
          <button 
            onClick={refetchDashboard}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-lg transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="h-screen w-full bg-slate-50/50 text-slate-800 font-sans p-6 flex flex-col overflow-hidden select-none">
      <div className="max-w-6xl w-full mx-auto flex flex-col h-full space-y-5">
        
        {/* 1. PREMIUM COMPACT HEADER */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-lg bg-slate-900 flex items-center justify-center text-xl font-medium text-white shadow-inner">
              {getInitials(profile.fullName)}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold text-slate-900 tracking-tight">{profile.fullName || "N/A"}</h1>
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
                  {profile.status || "Active"}
                </span>
                {profile.rank && (
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-100 rounded-md">
                    <Award className="w-3 h-3 mr-1 text-sky-500" /> {profile.rank}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-light flex items-center">
                <Fingerprint className="w-3 h-3 mr-1 text-slate-300" />
                <span>Account ID:</span>
                <span className="font-mono font-normal text-slate-700 ml-1">{profile.distributerId || "N/A"}</span>
              </p>
            </div>
          </div>

          <button 
            onClick={() => copyToClipboard(profile.distributerId)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium transition active:scale-98 cursor-pointer shadow-sm"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Copy ID</span>
          </button>
        </div>

        {/* 2. MAIN ACCORDED MATRIX GRID (Non-Scrollable Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-0 overflow-hidden">
          
          {/* LEFT PANEL: NETWORK MATRIX */}
          <div className="md:col-span-1 flex flex-col space-y-5 h-full">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex-1">
              <div>
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5 mb-3">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Network Matrix</h3>
                </div>
                
                <div className="space-y-3.5">
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <label className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Direct Sponsor</label>
                    <span className="text-xs font-medium text-slate-800 mt-0.5 block">{profile.sponsorName || "Root Node / Direct Team"}</span>
                  </div>
                  
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <label className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">KYC Compliance</label>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center mt-1">
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" /> {profile.kycStatus || "Fully Verified"}
                    </span>
                  </div>

                  {binaryStats && (
                    <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      <label className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Direct Channels</label>
                      <span className="text-xs font-medium text-slate-800 mt-0.5 block">{binaryStats.totalDirects || 0} Active Agents</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Vault Trigger */}
              <div className="border-t border-slate-100 pt-3 mt-4">
                <button className="w-full inline-flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg text-left text-xs font-medium text-slate-700 transition active:scale-98 cursor-pointer">
                  <span className="flex items-center"><Lock className="w-3.5 h-3.5 mr-2 text-slate-400" /> System Authentication</span>
                  <span className="text-[10px] bg-slate-200/60 px-2 py-0.5 rounded text-slate-500 font-mono">Update</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT METADATA PANEL: IDENTITY & SETTLEMENT */}
          <div className="md:col-span-2 flex flex-col space-y-5 h-full">
            
            {/* Identity Ledger Card (Masked Email & Phone) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5 mb-4">
                  <User className="w-4 h-4 text-slate-400" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Communication & Node Identity</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center">
                      <Mail className="w-3 h-3 mr-1 text-slate-300" /> Email Endpoint
                    </span>
                    {/* 🔒 Masked Email */}
                    <span className="text-xs font-mono font-medium text-slate-600 block break-all">{maskEmail(profile.email)}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center">
                      <Phone className="w-3 h-3 mr-1 text-slate-300" /> Registered Line
                    </span>
                    {/* 🔒 Masked Phone */}
                    <span className="text-xs font-mono font-medium text-slate-600 block">{maskPhone(profile.phone)}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-slate-300" /> Epoch Registration
                    </span>
                    <span className="text-xs font-medium text-slate-800 block">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      }) : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 🔒 Masked Address */}
              <div className="space-y-0.5 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-4">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-slate-300" /> Corporate Headquarters / Address
                </span>
                <span className="text-xs font-medium text-slate-500 block leading-relaxed">{maskAddress(profile.address)}</span>
              </div>
            </div>

            {/* Payout Details Card (Masked Account Number) */}
            {profile.bankDetails && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex-1">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5 mb-4">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Settlement & Clearing Node</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Financial Institution</span>
                    <span className="text-xs font-semibold text-slate-900 block">{profile.bankDetails.bankName || "N/A"}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Vault Account Number</span>
                    {/* 🔒 Masked Account Number */}
                    <span className="text-xs font-mono font-medium text-slate-600 block tracking-wide">{maskBankAccount(profile.bankDetails.accountNumber)}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Routing IFSC Identifier</span>
                    <span className="text-xs font-mono font-medium text-slate-800 block">{profile.bankDetails.ifscCode || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;