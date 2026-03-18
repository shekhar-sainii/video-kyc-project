import React from "react";
import Table from "../../../components/Table";
import { FiEye, FiShield, FiCheckCircle, FiActivity, FiUserCheck } from "react-icons/fi";
import { useSelector } from "react-redux";

const Html = ({ data, pagination, onView, onUpdateStatus, onPageChange }) => {
  const isDark = useSelector((state) => state.theme.mode === "dark");

  const columns = [
    {
      key: "applicant",
      name: "Applicant Identity",
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-xs border border-indigo-500/20">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className={`font-black text-sm tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>{row.name}</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              PAN: {row.pan}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      name: "KYC Status",
      render: (row) => (
        <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${
          row.status === 'Verified' ? "bg-green-500/10 border-green-500/20 text-green-500" :
          row.status === 'Rejected' ? "bg-red-500/10 border-red-500/20 text-red-500" :
          "bg-amber-500/10 border-amber-500/20 text-amber-500"
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "vision_score",
      name: "AI Vision Score",
      render: (row) => (
        <div className="flex flex-col gap-1.5 w-32">
           <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
             <span className={row.score > 80 ? "text-green-500" : row.score > 40 ? "text-amber-500" : "text-red-500"}>
                {row.score}% Match
             </span>
           </div>
           <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
             <div 
               className={`h-full transition-all duration-700 ${row.score > 80 ? "bg-green-500" : row.score > 40 ? "bg-amber-500" : "bg-red-500"}`} 
               style={{width: `${row.score}%`}}
             ></div>
           </div>
        </div>
      ),
    },
    {
      key: "date",
      name: "Submission Date",
      render: (row) => (
        <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {row.submittedAt}
        </span>
      ),
    },
    {
      key: "action",
      name: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => onView(row)}
            className={`p-2.5 rounded-xl transition-all border ${isDark ? "border-slate-700 hover:bg-slate-800 text-indigo-400" : "border-slate-100 hover:bg-indigo-50 text-indigo-600"}`}
            title="Full KYC Review"
          >
            <FiUserCheck size={18} />
          </button>
          <button
            onClick={() => onUpdateStatus(row)} 
            className={`p-2.5 rounded-xl transition-all border ${isDark ? "border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-indigo-400" : "border-slate-100 hover:bg-slate-50 text-slate-600"}`}
            title="Update Decision"
          >
            <FiShield size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={`rounded-[2.5rem] border-2 overflow-hidden shadow-2xl transition-all ${
      isDark ? "bg-[#1a2b4b] border-slate-700 shadow-blue-900/10" : "bg-white border-slate-100 shadow-indigo-100"
    }`}>
      <Table
        data={data || []}
        columns={columns}
        page={pagination?.currentPage || 1}
        count={pagination?.limit || 10}
        total={pagination?.totalUsers || 0}
        result={(e) => {
          if (e.event === "page") onPageChange(e.value);
        }}
      />
    </div>
  );
};

export default Html;