import React from "react";

import { FiShield, FiUser, FiClock, FiGlobe, FiSearch } from "react-icons/fi";
import BeautifulLoader from "../../common/BeautifulLoader";


const Html = ({ data, loading, isDark }) => {
  return (
    <div className="space-y-6">
      {/* Search & Utility Bar */}
      <div className={`p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between border ${
        isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100 shadow-sm"
      }`}>
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filter logs by user or action..." 
            className={`w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none ${isDark ? "text-white placeholder:text-slate-500" : "text-gray-900"}`}
          />
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase">
             Retention: 365 Days
           </span>
        </div>
      </div>

      {/* Audit Table */}
      <div className={`rounded-3xl border overflow-hidden transition-all ${
        isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100 shadow-sm"
      }`}>
        {loading ? (
          <div className="py-20">
            <BeautifulLoader text="Decrypting System Logs..." fullScreen={false} />

          </div>
        ) : (

          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? "border-slate-700 bg-slate-800/40" : "bg-slate-50 border-slate-100"}`}>
                <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400">Timestamp</th>
                <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400">Initiator</th>
                <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400">Action / Event</th>
                <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400">Target Object</th>
                <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-50"}`}>
              {data.map((log) => (
                <tr key={log.id} className={`transition-colors hover:bg-slate-500/5`}>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <FiClock size={12} />
                      <span className="text-xs font-mono">{log.timestamp}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <FiUser size={14} className="text-blue-500" />
                      <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{log.user}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                      log.action.includes("Delete") ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className={`p-5 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{log.target}</td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-500">
                      <FiGlobe size={12} />
                      <span className="text-[10px] font-mono">{log.ip}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Html;