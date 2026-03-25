import React from "react";
import { useSelector } from "react-redux";
import { FiShield } from "react-icons/fi";

const BeautifulLoader = ({ text = "Securing your connection...", fullScreen = true }) => {
  const isDark = useSelector((state) => state.theme.mode === "dark");

  const containerClasses = fullScreen
    ? `fixed inset-0 z-[100] flex flex-col items-center justify-center backdrop-blur-xl transition-all duration-500 ${
        isDark ? "bg-[#0f172a]/80" : "bg-white/80"
      }`
    : `relative flex flex-col items-center justify-center py-12 transition-all duration-500 w-full`;

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center">
        {/* Outer Pulsing Ring */}
        <div className="absolute w-24 h-24 rounded-full border-4 border-indigo-500/20 animate-ping" />
        
        {/* Inner Spinning Ring */}
        <div className={`w-20 h-20 rounded-full border-t-4 border-indigo-600 animate-spin transition-colors ${
          isDark ? "border-slate-800" : "border-slate-100"
        }`} />
        
        {/* Central Logo Box */}
        <div className="absolute w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/50 transform rotate-3 hover:rotate-0 transition-transform duration-500">
          <FiShield size={24} className="text-white" />
        </div>
      </div>

      <div className="mt-10 text-center space-y-2">
        <h3 className={`text-lg font-black tracking-tight uppercase ${
          isDark ? "text-white" : "text-slate-900"
        }`}>
          {text}
        </h3>
        <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
            Establishing Trust Loop
        </p>
      </div>

      {/* Decorative background elements */}
      {fullScreen && (
        <>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
        </>
      )}
    </div>
  );
};


export default BeautifulLoader;
