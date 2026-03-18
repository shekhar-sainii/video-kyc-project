import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Html from "./Html";
import { FiDownloadCloud, FiPieChart } from "react-icons/fi";

const UsageReports = () => {
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    setLoading(true);
    // Dummy Data matching the "Usage Overview" table in the mockup
    const dummyUsage = [
      { id: "REP-101", name: "Q1_Financials.pdf", date: "Mar 15, 2026", type: "Analysis", pages: 45, credits: 12.5 },
      { id: "REP-102", name: "Contract_Draft_v2.docx", date: "Mar 14, 2026", type: "Summary", pages: 12, credits: 4.0 },
      { id: "REP-103", name: "Market_Research.pdf", date: "Mar 12, 2026", type: "Full Extraction", pages: 120, credits: 35.0 },
      { id: "REP-104", name: "Product_Specs.pdf", date: "Mar 10, 2026", type: "Analysis", pages: 8, credits: 2.0 },
      { id: "REP-105", name: "Team_Sync_Notes.docx", date: "Mar 08, 2026", type: "Summary", pages: 5, credits: 1.5 },
    ];

    setTimeout(() => {
      setReportData(dummyUsage);
      setLoading(false);
    }, 700);
  }, []);

  return (
    <div className="p-8 space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-[#1a2b4b]"}`}>
            Usage Overview
          </h1>
          <p className={`${isDark ? "text-slate-400" : "text-gray-500"} text-sm`}>
            Detailed breakdown of your document processing activity and credit usage.
          </p>
        </div>
        <div className="flex gap-3">
          <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition ${
            isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}>
            <FiDownloadCloud /> Export CSV
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Total Pages" value="1,450" icon={<FiPieChart />} isDark={isDark} color="text-blue-500" />
        <SummaryCard title="Credits Used" value="412.5" icon={<FiPieChart />} isDark={isDark} color="text-indigo-500" />
        <SummaryCard title="Remaining" value="587.5" icon={<FiPieChart />} isDark={isDark} color="text-green-500" />
      </div>

      <Html 
        data={reportData} 
        loading={loading} 
        isDark={isDark} 
      />
    </div>
  );
};

const SummaryCard = ({ title, value, icon, isDark, color }) => (
  <div className={`p-6 rounded-3xl border ${isDark ? "bg-[#1a2b4b] border-slate-700 shadow-xl" : "bg-white border-slate-100 shadow-sm"}`}>
    <div className="flex justify-between items-center mb-3">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
      <div className={`${color} opacity-80`}>{icon}</div>
    </div>
    <h3 className={`text-3xl font-black ${isDark ? "text-white" : "text-[#1a2b4b]"}`}>{value}</h3>
  </div>
);

export default UsageReports;