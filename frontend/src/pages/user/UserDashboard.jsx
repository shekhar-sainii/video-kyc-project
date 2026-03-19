import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  FiPlus, 
  FiVideo, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiSearch,
  FiFilter,
  FiLoader
} from "react-icons/fi";
import kycService from "../../services/kycService";
import Swal from "sweetalert2";

const UserDashboard = () => {
  const navigate = useNavigate();
  const isDark = useSelector((state) => state.theme.mode === "dark");

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const res = await kycService.getApplications();
        setApplications(res.data.data || []);
      } catch (err) {
        const message = err?.response?.data?.message || "Failed to load applications.";
        Swal.fire("Error", message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  // PAN Masking Logic: ABCDE1234F -> ABCD••••4F
  const maskPan = (pan) => {
    if (!pan) return "";
    return `${pan.substring(0, 4)}••••${pan.substring(pan.length - 2)}`;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Verified": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
  };

  return (
    <div className={`min-h-screen py-10 px-6 transition-colors duration-300 ${isDark ? "bg-[#0f172a]" : "bg-[#f8fafd]"}`}>
      <div className="max-w-6xl mx-auto">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className={`text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              KYC Applications
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Manage and track your identity verification status</p>
          </div>
          
          <button 
            onClick={() => navigate("/kyc-application")}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
          >
            <FiPlus /> New Application
          </button>
        </div>

        {/* --- Filters & Search (UI Only) --- */}
        <div className="flex flex-wrap gap-4 mb-8">
            <div className={`flex-1 min-w-[250px] relative`}>
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by PAN..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none transition-all ${isDark ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500" : "bg-white border-slate-100 focus:border-indigo-600"}`}
                />
            </div>
            <button className={`px-5 py-3 rounded-xl border-2 flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${isDark ? "border-slate-700 text-slate-400" : "border-slate-100 text-slate-600"}`}>
                <FiFilter /> Filter
            </button>
        </div>

        {/* --- Applications List --- */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div className="space-y-4">
          {!loading && applications
            .filter(app => !searchTerm || (app.panNumber || app.pan_number || "").toLowerCase().includes(searchTerm.toLowerCase()))
            .map((app) => (
            <div 
              key={app._id || app.id} 
              className={`group p-6 rounded-[2rem] border-2 transition-all hover:shadow-2xl hover:shadow-indigo-500/5 ${
                isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100 shadow-sm"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Application Info */}
                <div className="flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                    <FiClock className="text-indigo-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                            {maskPan(app.panNumber || app.pan_number)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(app.status)}`}>
                            {app.status}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        ID: {app._id || app.id} • Submitted: {new Date(app.submittedAt || app.submitted_at).toLocaleString()}
                    </p>
                    {app.status === "Pending" && typeof app.attemptsRemaining === "number" && (
                      <p className="mt-2 text-[11px] font-bold text-amber-500">
                        Attempts left: {app.attemptsRemaining}/{app.maxVerificationAttempts || 5}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {app.status === "Pending" ? (
                    <button 
                      onClick={() => navigate(`/live-session/${app._id || app.id}`)}
                      className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.1em] text-white shadow-lg transition-all active:scale-95 ${
                        "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
                      }`}
                    >
                      <FiVideo size={18} /> Start Video KYC
                    </button>
                  ) : (
                    <div className={`px-6 py-4 rounded-2xl border-2 flex items-center gap-3 text-xs font-black uppercase tracking-widest ${
                        app.status === "Verified" ? "border-green-500/20 text-green-500" : "border-red-500/20 text-red-500"
                    }`}>
                        {app.status === "Verified" ? <FiCheckCircle size={18} /> : <FiXCircle size={18} />}
                        {app.status === "Verified" ? "Verified" : "Rejected"}
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Empty State Mockup */}
        {applications.length === 0 && (
            <div className="py-20 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiSearch size={32} className="text-slate-300" />
                </div>
                <h2 className="text-xl font-bold text-slate-400 italic">No applications found</h2>
                <p className="text-slate-400 text-sm mt-2">Click 'New Application' to start your KYC process.</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default UserDashboard;
