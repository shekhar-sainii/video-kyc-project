import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  FiFileText, FiZap, FiCheckCircle, FiChevronRight, 
  FiMaximize, FiDownload, FiShare2 
} from "react-icons/fi";

const DocumentAnalysis = () => {
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const [loading, setLoading] = useState(true);

  // Mock Data: Mockup ke contents ke hisaab se
  const [doc, setDoc] = useState({
    name: "annual_report_2025.pdf",
    summary: "The document highlights a 15% increase in annual revenue, driven primarily by the expansion of the SaaS vertical and a 20% reduction in operational overhead. Key risks include market volatility in Q4 and supply chain adjustments.",
    entities: [
      { label: "Company Name", value: "Global Dynamics Inc.", confidence: "99%" },
      { label: "Fiscal Year", value: "2025", confidence: "100%" },
      { label: "Total Revenue", value: "$4.2M", confidence: "98%" },
      { label: "Net Profit", value: "$1.1M", confidence: "97%" },
      { label: "Tax ID", value: "99-8877665", confidence: "99%" }
    ]
  });

  useEffect(() => {
    // Simulating loading to show the skeleton/loader
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center font-bold tracking-widest animate-pulse ${isDark ? "text-blue-400 bg-[#0f172a]" : "text-blue-600 bg-[#f8fafd]"}`}>
        INITIALIZING ANALYTICS...
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDark ? "bg-[#0f172a]" : "bg-[#f8fafd]"}`}>
      
      {/* --- TOP HEADER --- */}
      <header className={`px-8 py-4 border-b flex justify-between items-center sticky top-0 z-20 ${isDark ? "bg-[#1a2b4b] border-slate-700 shadow-xl" : "bg-white border-slate-100 shadow-sm"}`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <FiFileText size={20} />
          </div>
          <div>
            <h1 className={`text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-[#1a2b4b]"}`}>{doc.name}</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Analysis Completed</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className={`p-2 rounded-lg transition ${isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-400 hover:bg-slate-50"}`}>
            <FiShare2 size={18} />
          </button>
          <button className={`p-2 rounded-lg transition ${isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-400 hover:bg-slate-50"}`}>
            <FiDownload size={18} />
          </button>
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all ml-2">
            Export Results
          </button>
        </div>
      </header>

      {/* --- MAIN SPLIT CONTENT --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT: Document Reference (PDF Style) */}
        <section className={`w-1/2 p-8 overflow-y-auto flex justify-center border-r ${isDark ? "bg-[#0f172a] border-slate-800" : "bg-slate-100 border-slate-200"}`}>
          <div className="w-full max-w-2xl bg-white shadow-2xl rounded-sm p-12 min-h-[900px] relative border border-slate-200">
            <div className="absolute top-6 right-6 flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-300 uppercase">Page 1 of 12</span>
                <FiMaximize className="text-slate-300 cursor-pointer hover:text-blue-500" />
            </div>
            
            {/* Mock PDF Content Visuals */}
            <div className="h-6 w-1/4 bg-slate-100 mb-12 rounded"></div>
            <div className="space-y-4 mb-10">
              <div className="h-3 w-full bg-slate-50 rounded"></div>
              <div className="h-3 w-full bg-slate-50 rounded"></div>
              <div className="h-3 w-4/5 bg-slate-50 rounded"></div>
              <div className="h-3 w-full bg-slate-50 rounded"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="h-40 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
                  <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Financial Chart</span>
              </div>
              <div className="h-40 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
                  <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Growth Matrix</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-3 w-full bg-slate-50 rounded"></div>
              <div className="h-3 w-3/4 bg-slate-50 rounded"></div>
              <div className="h-3 w-full bg-slate-50 rounded"></div>
            </div>
          </div>
        </section>

        {/* RIGHT: AI Insights (Data Panel) */}
        <section className={`w-1/2 p-10 overflow-y-auto ${isDark ? "bg-[#1a2b4b]" : "bg-white"}`}>
          <div className="max-w-xl mx-auto">
            
            {/* 1. Summary Card */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                  <FiZap size={20} />
                </div>
                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-[#1a2b4b]"}`}>AI Executive Summary</h2>
              </div>
              <div className={`p-8 rounded-[2rem] leading-relaxed text-sm shadow-sm border transition-all ${
                isDark 
                ? "bg-slate-800/50 border-slate-700 text-slate-300" 
                : "bg-blue-50/30 text-slate-600 border-blue-100"
              }`}>
                {doc.summary}
              </div>
            </div>

            {/* 2. Extracted Entities Grid */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-500/10 text-green-500 rounded-xl">
                    <FiCheckCircle size={20} />
                  </div>
                  <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-[#1a2b4b]"}`}>Extracted Insights</h2>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Validated</span>
                    <span className="text-[10px] text-slate-400 font-bold">Confidence Avg: 98.6%</span>
                </div>
              </div>

              <div className="grid gap-3">
                {doc.entities.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex justify-between items-center p-5 rounded-2xl border transition-all hover:translate-x-1 ${
                      isDark 
                      ? "bg-slate-800/40 border-slate-700 hover:border-blue-500/50" 
                      : "bg-white border-slate-100 shadow-sm hover:border-blue-200"
                    }`}
                  >
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-0.5">{item.label}</span>
                        <span className={`text-sm font-black ${isDark ? "text-slate-100" : "text-[#1a2b4b]"}`}>{item.value}</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-500/5 px-2 py-1 rounded-md">{item.confidence}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Action CTA (Chat Trigger) */}
            <div className={`p-8 rounded-[2.5rem] flex items-center justify-between group cursor-pointer transition-all hover:scale-[1.02] ${
              isDark 
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20" 
              : "bg-[#1a2b4b] text-white shadow-2xl"
            }`}>
               <div>
                 <h4 className="text-lg font-black tracking-tight mb-1">Deeper Analysis?</h4>
                 <p className="text-xs opacity-70 font-medium">Chat with this document to get instant answers.</p>
               </div>
               <div className="bg-white/20 p-4 rounded-2xl group-hover:bg-white/30 transition-all">
                 <FiChevronRight size={22} />
               </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
};

export default DocumentAnalysis;