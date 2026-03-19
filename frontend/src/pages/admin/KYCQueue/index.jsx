import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  FiSearch, FiFilter, FiArrowRight
} from "react-icons/fi";
import Table from "../../../components/Table"; // Use your existing table component
import Swal from "sweetalert2";
import kycService from "../../../services/kycService";

const KYCQueue = () => {
  const navigate = useNavigate();
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [queue, setQueue] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [summary, setSummary] = useState({
    total: 0,
    slaCompliance: "100%",
    averageReviewTime: "0.0m",
    automationRate: "100%",
  });

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        setLoading(true);
        const res = await kycService.getAdminQueue({
          page: pagination.page,
          limit: pagination.limit,
        });
        const payload = res?.data?.data || {};
        setQueue(payload.queue || []);
        setSummary(payload.summary || {});
        setPagination((prev) => ({
          ...prev,
          page: payload.pagination?.page || prev.page,
          limit: payload.pagination?.limit || prev.limit,
          total: payload.pagination?.total || 0,
        }));
      } catch (error) {
        const message = error?.response?.data?.message || "Failed to load KYC queue.";
        Swal.fire("Error", message, "error");
      } finally {
        setLoading(false);
      }
    };

    void fetchQueue();
  }, [pagination.page, pagination.limit]);

  const filteredQueue = queue.filter((row) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      row.name.toLowerCase().includes(term) ||
      row.pan.toLowerCase().includes(term) ||
      row.email.toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      key: "applicant",
      name: "Applicant",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black border border-indigo-500/20">
            {row.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className={`font-black text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{row.name}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.pan}</span>
          </div>
        </div>
      ),
    },
    {
      key: "submission",
      name: "Submitted At",
      render: (row) => (
        <div className="flex flex-col">
          <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>{row.date}</span>
          <span className="text-[10px] opacity-50 font-medium">{row.time}</span>
        </div>
      ),
    },
    {
      key: "ai_score",
      name: "AI Confidence",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-lg text-[10px] font-black border ${
            row.score > 80 ? "bg-green-500/10 text-green-500 border-green-500/20" : 
            row.score > 40 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
            "bg-red-500/10 text-red-500 border-red-500/20"
          }`}>
            {row.score}% Match
          </div>
        </div>
      ),
    },
    {
        key: "priority",
        name: "Priority",
        render: (row) => (
          <span className={`text-[9px] font-black uppercase tracking-widest ${
            row.priority === 'Critical' ? "text-red-500" : "text-slate-400"
          }`}>
            {row.priority}
          </span>
        ),
      },
    {
      key: "action",
      name: "Action",
      render: (row) => (
        <button
          onClick={() => navigate(`/admin/kyc-review/${row._id}`)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            isDark ? "bg-slate-800 hover:bg-indigo-600 text-white" : "bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600"
          }`}
        >
          Review <FiArrowRight />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={`text-2xl font-black tracking-tight uppercase italic sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
            Verification Queue
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
             <p className="text-xs font-medium text-slate-500 sm:text-sm">{queue.length} Applications awaiting manual review</p>
          </div>
        </div>
        
        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
             <div className={`relative flex-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                <input 
                    type="text" 
                    placeholder="Search applicant..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full rounded-xl border-2 py-2.5 pl-10 pr-4 text-xs font-bold outline-none transition-all ${
                        isDark ? "bg-slate-800 border-slate-700 focus:border-indigo-500" : "bg-white border-slate-100 focus:border-indigo-600"
                    }`}
                />
             </div>
             <button className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 ${isDark ? "border-slate-700 text-slate-400" : "border-slate-100 text-slate-500"}`}>
                <FiFilter />
             </button>
        </div>
      </div>

      {/* --- QUEUE STATUS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatusBox label="SLA Compliance" value={summary.slaCompliance || "100%"} sub="Applications processed < 24h" color="text-indigo-500" />
         <StatusBox label="Average Review Time" value={summary.averageReviewTime || "0.0m"} sub="Per manual verification" color="text-blue-500" />
         <StatusBox label="AI Automation Rate" value={summary.automationRate || "100%"} sub="Auto-prioritized queue insights" color="text-green-500" />
      </div>

      {/* --- TABLE AREA --- */}
      <div className={`overflow-hidden rounded-[2rem] border-2 shadow-2xl lg:rounded-[2.5rem] ${
        isDark ? "bg-[#1a2b4b] border-slate-700 shadow-indigo-900/10" : "bg-white border-slate-100"
      }`}>
        <Table
          data={filteredQueue}
          columns={columns}
          page={pagination.page}
          count={pagination.limit}
          total={searchTerm ? filteredQueue.length : pagination.total}
          result={(event) => {
            if (event.event === "page") {
              setPagination((prev) => ({ ...prev, page: event.value }));
            }

            if (event.event === "count") {
              setPagination((prev) => ({ ...prev, page: 1, limit: event.value }));
            }
          }}
        />
      </div>
    </div>
  );
};

const StatusBox = ({ label, value, sub, color }) => {
    const isDark = useSelector((state) => state.theme.mode === "dark");
    return (
        <div className={`rounded-[1.75rem] border-2 p-5 sm:p-6 lg:rounded-[2rem] ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
            <h3 className={`text-2xl font-black italic ${color}`}>{value}</h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{sub}</p>
        </div>
    );
};

export default KYCQueue;
