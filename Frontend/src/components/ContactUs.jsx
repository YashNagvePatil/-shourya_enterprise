import React, { useState } from "react";

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    agentId: "",
    email: "",
    contact: "",
    category: "General Inquiry",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("[MLM CONTACT FORM SUBMITTED]:", formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans">
      {/* Centered Middle Card */}
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        
        {/* Header */}
        <div className="mb-6 border-b border-zinc-800 pb-4">
          <h1 className="text-xl sm:text-2xl font-light tracking-tight text-white">
            Contact <span className="font-bold text-white">Support Desk</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Fill in your query details below for MLM network & distributor assistance.
          </p>
        </div>

        {/* Success Alert */}
        {submitted && (
          <div className="mb-4 p-3 bg-white text-black text-xs font-semibold rounded-lg flex items-center justify-between animate-fadeIn">
            <span>✓ Message details printed to console!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Rahul Sharma"
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all"
              />
            </div>

            {/* Agent ID */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Agent / Distributor ID <span className="text-zinc-500 text-[10px]">(Optional)</span>
              </label>
              <input
                type="text"
                name="agentId"
                value={formData.agentId}
                onChange={handleChange}
                placeholder="e.g. AGT1001"
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all uppercase"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="rahul@example.com"
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all"
              />
            </div>

            {/* Mobile Contact */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                placeholder="9876543210"
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Select Department *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-500 transition-all cursor-pointer"
            >
              <option value="General Inquiry">General Inquiry</option>
              <option value="Commission & Payout">Commission & Payout Issues</option>
              <option value="Binary Tree & Placement">Binary Placement / Tree Issue</option>
              <option value="Product & Appliance Support">Product & Warranty Claim</option>
              <option value="KYC & Bank Verification">KYC & Document Update</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Brief summary of your query"
              className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all"
            />
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Message *
            </label>
            <textarea
              name="message"
              rows="3"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Describe your issue or request in detail..."
              className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all resize-none"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-lg transition-all active:scale-[0.99] cursor-pointer mt-2"
          >
            Send Message →
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;