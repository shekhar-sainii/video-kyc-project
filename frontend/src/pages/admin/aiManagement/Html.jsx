import React from "react";
import { FiCpu, FiSettings, FiActivity, FiRefreshCw, FiZap } from "react-icons/fi";

const Html = ({ data, loading, isDark, onToggleStatus }) => {
  return (
    <div className="space-y-6">
      {/* Model Performance Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-3xl border ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">System Throughput</p>
          <h3 className={`text-2xl font-black ${isDark ? "text-white" : "text-[#1a2b4b]"}`}>1.2k req/min</h3>
        </div>
        <div className={`p-6 rounded-3xl border ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Avg. Accuracy</p>
          <h3 className={`text-2xl font-black text-blue-500`}>98.4%</h3>
        </div>
        <div className={`p-6 rounded-3xl border ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">API Latency</p>
          <h3 className={`text-2xl font-black ${isDark ? "text-white" : "text-[#1a2b4b]"}`}>142ms</h3>
        </div>
      </div>

      {/* Model Table */}
      <div className={`rounded-3xl border overflow-hidden transition-all ${
        isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100 shadow-sm"
      }`}>
        {loading ? (
          <div className="p-20 text-center text-blue-500 font-bold animate-pulse text-xs tracking-widest">
            INITIALIZING AI ENGINES...
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? "border-slate-700 bg-slate-800/40" : "bg-slate-50 border-slate-100"}`}>
                <th className={`p-5 font-bold uppercase text-[10px] tracking-widest ${isDark ? "text-slate-400" : "text-slate-400"}`}>Model Identity</th>
                <th className={`p-5 font-bold uppercase text-[10px] tracking-widest ${isDark ? "text-slate-400" : "text-slate-400"}`}>Provider</th>
                <th className={`p-5 font-bold uppercase text-[10px] tracking-widest ${isDark ? "text-slate-400" : "text-slate-400"}`}>Status</th>
                <th className={`p-5 font-bold uppercase text-[10px] tracking-widest ${isDark ? "text-slate-400" : "text-slate-400"}`}>Latency/Acc</th>
                <th className={`p-5 font-bold uppercase text-[10px] tracking-widest ${isDark ? "text-slate-400" : "text-slate-400"} text-right`}>Config</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-50"}`}>
              {data.map((model) => (
                <tr key={model.id} className={`transition-colors group ${isDark ? "hover:bg-slate-800/30" : "hover:bg-blue-50/50"}`}>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? "bg-slate-800 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                        <FiCpu size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-bold ${isDark ? "text-slate-100" : "text-[#1a2b4b]"}`}>{model.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{model.type}</span>
                      </div>
                    </div>
                  </td>
                  <td className={`p-5 font-bold text-xs uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>{model.provider}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tighter ${
                      model.status === "Active" 
                      ? "bg-green-500/10 text-green-400 border-green-500/20" 
                      : model.status === "Offline" 
                      ? "bg-red-500/10 text-red-400 border-red-500/20" 
                      : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    }`}>
                      {model.status}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{model.latency}</span>
                        <span className="text-[10px] text-slate-500">Latency</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-blue-500">{model.accuracy}</span>
                        <span className="text-[10px] text-slate-500">Accuracy</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => onToggleStatus(model)}
                      className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-600"}`}
                    >
                      <FiSettings size={18} />
                    </button>
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