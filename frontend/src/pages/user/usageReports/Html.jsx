import React from "react";
import { FiFileText, FiChevronRight } from "react-icons/fi";

const Html = ({ data, loading, isDark }) => {
  return (
    <div className={`rounded-3xl border overflow-hidden transition-all ${
      isDark ? "bg-[#1a2b4b] border-slate-700 shadow-2xl" : "bg-white border-slate-100 shadow-sm"
    }`}>
      {loading ? (
        <div className="p-20 text-center text-blue-500 font-bold animate-pulse text-xs tracking-widest uppercase">
          Generating Usage Report...
        </div>
      ) : (
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className={`border-b ${isDark ? "border-slate-700 bg-slate-800/40" : "bg-slate-50 border-slate-100"}`}>
              <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400">Document</th>
              <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400">Date</th>
              <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400">Process Type</th>
              <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400">Pages</th>
              <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400">Credits</th>
              <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400 text-right">Details</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-50"}`}>
            {data.map((row) => (
              <tr key={row.id} className={`transition-all group ${isDark ? "hover:bg-slate-800/30" : "hover:bg-blue-50/40"}`}>
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? "bg-slate-800 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                      <FiFileText size={16} />
                    </div>
                    <span className={`font-bold ${isDark ? "text-slate-100" : "text-[#1a2b4b]"}`}>{row.name}</span>
                  </div>
                </td>
                <td className={`p-5 text-xs font-medium ${isDark ? "text-slate-400" : "text-gray-500"}`}>{row.date}</td>
                <td className="p-5">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter ${
                    isDark ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-blue-50 text-blue-600 border border-blue-100"
                  }`}>
                    {row.type}
                  </span>
                </td>
                <td className={`p-5 font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>{row.pages}</td>
                <td className="p-5">
                  <span className="font-black text-blue-500">-{row.credits}</span>
                </td>
                <td className="p-5 text-right">
                  <button className={`p-2 rounded-lg transition-all ${isDark ? "text-slate-500 hover:text-white" : "text-slate-300 hover:text-blue-600"}`}>
                    <FiChevronRight size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Html;