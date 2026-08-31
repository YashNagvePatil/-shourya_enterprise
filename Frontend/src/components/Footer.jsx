import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#2A1815] text-[#FAF5EE] font-light border-t border-[#F59E35]/20 pt-16 pb-8 transition-colors duration-300 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#F59E35]/15">
          
          {/* Column 1: Brand & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <a href="#" className="inline-block hover:opacity-80 transition-opacity">
              <img 
                src="/logo.png" 
                alt="Company Logo" 
                className="w-28 sm:w-32 h-auto object-contain"
              />
            </a>
            <p className="text-[#FAF5EE]/70 text-sm font-light leading-relaxed max-w-sm">
              Empowering independent entrepreneurs through premium quality products and an unmatched binary growth ecosystem.
            </p>
            
            {/* Newsletter Input */}
            <div className="pt-2">
              <span className="block text-xs uppercase tracking-widest text-[#FAF5EE]/90 font-light mb-2">
                Join Our Global Network
              </span>
              <form onSubmit={(e) => e.preventDefault()} className="flex max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border border-[#F59E35]/30 px-4 py-2.5 text-sm text-[#FAF5EE] placeholder-[#FAF5EE]/40 focus:outline-none focus:border-[#F59E35] transition-colors rounded-l"
                />
                <button
                  type="submit"
                  className="bg-[#DC2643] text-[#FAF5EE] text-xs font-light uppercase tracking-widest px-5 py-2.5 hover:bg-[#b81d34] transition-colors whitespace-nowrap rounded-r"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-normal uppercase tracking-widest text-[#F59E35]">
              Company
            </h3>
            <ul className="space-y-2 text-xs uppercase tracking-wider font-light">
              <li>
                <a href="#about" className="text-[#FAF5EE]/70 hover:text-[#F59E35] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#vision" className="text-[#FAF5EE]/70 hover:text-[#F59E35] transition-colors">
                  Our Vision
                </a>
              </li>
              <li>
                <a href="#products" className="text-[#FAF5EE]/70 hover:text-[#F59E35] transition-colors">
                  Products
                </a>
              </li>
              <li>
                <a href="#contact" className="text-[#FAF5EE]/70 hover:text-[#F59E35] transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Business Opportunity / MLM */}
          <div className="space-y-3">
            <h3 className="text-xs font-normal uppercase tracking-widest text-[#F59E35]">
              Opportunity
            </h3>
            <ul className="space-y-2 text-xs uppercase tracking-wider font-light">
              <li>
                <a href="/login" className="text-[#FAF5EE]/70 hover:text-[#F59E35] transition-colors">
                  Partner Portal
                </a>
              </li>
              <li>
                <a href="#become-agent" className="text-[#FAF5EE]/70 hover:text-[#F59E35] transition-colors">
                  Become an Agent
                </a>
              </li>
              <li>
                <a href="#compensation" className="text-[#FAF5EE]/70 hover:text-[#F59E35] transition-colors">
                  Compensation Plan
                </a>
              </li>
              <li>
                <a href="#training" className="text-[#FAF5EE]/70 hover:text-[#F59E35] transition-colors">
                  Leadership Hub
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Compliance */}
          <div className="space-y-3">
            <h3 className="text-xs font-normal uppercase tracking-widest text-[#F59E35]">
              Compliance
            </h3>
            <ul className="space-y-2 text-xs uppercase tracking-wider font-light">
              <li>
                <a href="#privacy" className="text-[#FAF5EE]/70 hover:text-[#F59E35] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-[#FAF5EE]/70 hover:text-[#F59E35] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#disclaimer" className="text-[#FAF5EE]/70 hover:text-[#F59E35] transition-colors">
                  Income Disclosure
                </a>
              </li>
              <li>
                <a href="#refund" className="text-[#FAF5EE]/70 hover:text-[#F59E35] transition-colors">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* MLM Mandatory Income Disclaimer Notice */}
        <div className="py-6 border-b border-[#F59E35]/15 text-[#FAF5EE]/50 text-[11px] leading-relaxed font-light">
          <p>
            <strong className="text-[#FAF5EE]/80">Earnings & Income Disclaimer:</strong> Earnings and commission structures are based on product sales volume and individual effort. Performance results will vary depending on dedication, market conditions, and sales expertise. The company does not guarantee any specific financial return or level of success.
          </p>
        </div>

        {/* Bottom Bar: Copyright & Social Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF5EE]/60 space-y-4 sm:space-y-0 font-light">
          <p className="tracking-widest uppercase">
            © {new Date().getFullYear()} STUDIO. All Rights Reserved.
          </p>

          {/* Minimal Social Links */}
          <div className="flex space-x-6 text-[#FAF5EE]/70">
            <a href="#" className="hover:text-[#F59E35] transition-colors" aria-label="Facebook">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
            <a href="#" className="hover:text-[#F59E35] transition-colors" aria-label="Instagram">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect width={20} height={20} x={2} y={2} rx={5} ry={5}/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1={17.5} x2={17.51} y1={6.5} y2={6.5}/></svg>
            </a>
            <a href="#" className="hover:text-[#F59E35] transition-colors" aria-label="LinkedIn">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx={4} cy={4} r={2}/></svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;