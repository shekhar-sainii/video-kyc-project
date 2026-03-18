import React from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
  const isDark = useSelector((state) => state.theme.mode === "dark");

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`rounded-[2rem] p-6 shadow-sm border transition-all
        ${isDark ? "bg-[#1a2b4b] border-slate-700 text-gray-200" : "bg-white border-slate-100 text-[#1a2b4b] shadow-indigo-100"}
      `}
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`p-3 rounded-2xl ${isDark ? "bg-slate-800 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
          <Icon size={22} />
        </div>
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
            trend === 'Safe' || trend.includes('+') ? 'text-green-500 bg-green-500/10' : 'text-amber-500 bg-amber-500/10'
        }`}>
            {trend}
        </span>
      </div>
      
      <div>
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {title}
        </p>
        <h2 className="text-3xl font-black mt-1 tracking-tighter italic uppercase">{value}</h2>
      </div>
    </motion.div>
  );
};

export default StatsCard;