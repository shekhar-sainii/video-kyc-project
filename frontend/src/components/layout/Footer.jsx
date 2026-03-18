import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { 
  FiGithub, FiTwitter, FiLinkedin, FiMail, 
  FiMessageSquare, FiBook, FiShield, FiLock, FiCheckCircle 
} from "react-icons/fi";

const Footer = () => {
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const role = useSelector((state) => state.auth.role); // Role check for links

  return (
    <footer className={`transition-colors duration-300 border-t ${
      isDark ? "bg-[#0f172a] border-slate-800 text-slate-400" : "bg-white border-slate-100 text-slate-600"
    }`}>
      
      {/* 1. MAIN LINKS SECTION */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        
        {/* BRAND & SECURITY */}
        <div className="lg:col-span-2 space-y-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
              <FiShield size={22} />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-black tracking-tight leading-none ${isDark ? "text-white" : "text-[#1e1b4b]"}`}>
                FinVerify
              </span>
              <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-1">Identity Pro</span>
            </div>
          </Link>
          <p className="text-sm leading-relaxed max-w-sm font-medium">
            AI-powered Video KYC infrastructure designed for modern FinTech compliance. 
            Automating identity verification with 99.9% precision and bank-grade security.
          </p>
          <div className="flex gap-4">
            <SocialIcon icon={<FiTwitter />} isDark={isDark} />
            <SocialIcon icon={<FiLinkedin />} isDark={isDark} />
            <SocialIcon icon={<FiGithub />} isDark={isDark} />
          </div>
        </div>

        {/* WORKFLOW */}
        <div>
          <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
            Identity Workflow
          </h4>
          <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
            {role === 'admin' ? (
              <>
                <li><Link to="/admin" className="hover:text-indigo-500 transition-colors">Overview</Link></li>
                <li><Link to="/admin/kyc-queue" className="hover:text-indigo-500 transition-colors">Review Queue</Link></li>
                <li><Link to="/admin/logs" className="hover:text-indigo-500 transition-colors">Security Logs</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/dashboard" className="hover:text-indigo-500 transition-colors">My Applications</Link></li>
                <li><Link to="/kyc-application" className="hover:text-indigo-500 transition-colors">Submit KYC</Link></li>
                <li><Link to="/profile" className="hover:text-indigo-500 transition-colors">Profile Verification</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* COMPLIANCE */}
        <div>
          <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
            Compliance
          </h4>
          <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
            <li><Link to="/docs" className="hover:text-indigo-500 transition-colors flex items-center gap-2"><FiBook size={14}/> Guidelines</Link></li>
            <li><Link to="/security" className="hover:text-indigo-500 transition-colors flex items-center gap-2"><FiLock size={14}/> Security Hub</Link></li>
            <li><Link to="/support" className="hover:text-indigo-500 transition-colors flex items-center gap-2"><FiMessageSquare size={14}/> Support</Link></li>
          </ul>
        </div>

        {/* LEGAL */}
        <div>
          <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
            Privacy & Trust
          </h4>
          <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
            <li><Link to="/privacy" className="hover:text-indigo-500 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-indigo-500 transition-colors">GDPR / Data Law</Link></li>
            <li><Link to="/contact" className="hover:text-indigo-500 transition-colors flex items-center gap-2"><FiMail size={14}/> Audit Inquiry</Link></li>
          </ul>
        </div>
      </div>

      {/* 2. TRUST BADGES SECTION */}
      <div className={`py-10 border-t ${isDark ? "border-slate-800 bg-black/20" : "border-slate-100 bg-slate-50/50"}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex flex-wrap items-center justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-tighter">RBI COMPLIANT</span>
             </div>
             <div className="flex items-center gap-2">
                <FiLock className="text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-tighter">AES-256 ENCRYPTED</span>
             </div>
             <div className="flex items-center gap-2">
                <FiShield className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-tighter">SOC2 TYPE II</span>
             </div>
          </div>

          <div className="text-center md:text-right">
             <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">
                © 2026 FINVERIFY AI • SECURE COMPLIANCE INFRASTRUCTURE
             </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon, isDark }) => (
  <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${
    isDark 
    ? "border-slate-800 bg-slate-900 text-slate-500 hover:text-white hover:border-indigo-600 hover:bg-indigo-600" 
    : "border-slate-100 bg-white text-slate-400 hover:text-white hover:border-indigo-600 hover:bg-indigo-600 shadow-sm"
  }`}>
    {icon}
  </button>
);

export default Footer;