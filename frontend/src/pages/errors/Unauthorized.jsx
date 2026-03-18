import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiShieldOff, FiArrowLeft, FiHome, FiLock } from "react-icons/fi";

const Unauthorized = () => {
  const navigate = useNavigate();
  const isDark = useSelector((state) => state.theme.mode === "dark");

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 
      ${isDark ? "bg-[#0f172a]" : "bg-[#f8fafd]"}`}>
      
      <div className="max-w-md w-full text-center">
        {/* --- Animated Security Icon --- */}
        <div className="relative mb-10 flex justify-center">
          <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center transition-all shadow-2xl 
            ${isDark ? "bg-red-500/10 text-red-500" : "bg-red-50 text-red-600"}`}>
            <FiShieldOff size={56} strokeWidth={1.5} className="animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
            <FiLock className="text-red-500" size={20} />
          </div>
        </div>

        {/* --- Error Text --- */}
        <div className="space-y-4 mb-12">
          <h1 className={`text-5xl font-black tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
            Access Denied
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] w-8 bg-red-500/50"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Error 403</span>
            <span className="h-[1px] w-8 bg-red-500/50"></span>
          </div>
          <p className={`text-sm font-medium leading-relaxed px-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Your current security clearance level does not permit access to this workspace module. 
            Please contact your administrator if you believe this is an error.
          </p>
        </div>

        {/* --- Action Buttons --- */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => navigate(-1)}
            className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-sm transition-all border-2 
              ${isDark 
                ? "border-slate-700 text-white hover:bg-slate-800" 
                : "border-slate-100 text-slate-700 hover:bg-slate-50 shadow-sm"}`}
          >
            <FiArrowLeft /> Go Back
          </button>
          
          <button 
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <FiHome /> Return to Base
          </button>
        </div>

        {/* --- Bottom Compliance Tag --- */}
        <div className="mt-16 opacity-30">
          <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${isDark ? "text-white" : "text-slate-900"}`}>
            FinVerify • Protocol Security System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;