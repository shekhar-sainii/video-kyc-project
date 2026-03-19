import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

import StatsCard from "./StatsCard";
import { 
  FiUsers, FiShield, FiActivity, FiZap, FiSearch
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import kycService from "../../../services/kycService";

const Dashboard = () => {
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalApplicants: 0,
      pendingReview: 0,
      verificationRate: "0.0%",
      rejectionRate: "0.0%",
    },
    trend: [],
    recentQueue: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await kycService.getAdminDashboard();
        setDashboardData(res?.data?.data || {});
      } catch (error) {
        const message = error?.response?.data?.message || "Failed to load admin dashboard.";
        Swal.fire("Error", message, "error");
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboard();
  }, []);

  return (
    <div className={`min-h-screen space-y-5 p-4 transition-colors duration-300 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8
        ${isDark ? "bg-[#0f172a] text-gray-200" : "bg-[#f8fafd] text-[#1a2b4b]"}
      `}
    >
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase italic sm:text-3xl">Compliance Dashboard</h1>
          <p className="text-xs font-medium text-slate-500 sm:text-sm">Monitoring real-time Identity Verifications & AI Vision Scores.</p>
        </div>
        {/* <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <div className="relative flex-1">
             <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input type="text" placeholder="Search PAN/Application ID..." className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`} />
          </div>
          <button className="rounded-xl bg-indigo-600 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 sm:px-6">
            Reports
          </button>
        </div> */}
      </div>

      {/* STATS GRID - KYC Specific Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Applicants" value={String(dashboardData.summary?.totalApplicants ?? 0)} icon={FiUsers} color="indigo" trend={loading ? "Loading" : "Live"} />
        <StatsCard title="Pending Review" value={String(dashboardData.summary?.pendingReview ?? 0)} icon={FiActivity} color="orange" trend={dashboardData.summary?.pendingReview > 0 ? "Queued" : "Clear"} />
        <StatsCard title="Verification Rate" value={dashboardData.summary?.verificationRate ?? "0.0%"} icon={FiZap} color="green" trend="Dynamic" />
        <StatsCard title="Rejection Rate" value={dashboardData.summary?.rejectionRate ?? "0.0%"} icon={FiShield} color="red" trend="Monitored" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        {/* CHART - Application Traffic */}
        <div className={`lg:col-span-2 rounded-[2rem] border p-5 transition-all sm:p-6 lg:rounded-[2.5rem] lg:p-8
          ${isDark ? "bg-[#1a2b4b] border-slate-700 shadow-2xl" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest sm:text-sm">
              <FiActivity className="text-indigo-500" /> Verification Velocity
            </h2>
            <div className="w-fit rounded-lg bg-indigo-500/10 px-3 py-1 text-[10px] font-black uppercase text-indigo-500">Live Updates</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData.trend || []}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#2d3748" : "#f1f5f9"} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="apps" stroke="#6366f1" strokeWidth={4} fill="url(#colorApps)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* SYSTEM HEALTH & QUICK ACTIONS */}
        <div className="space-y-6">
          <div className={`rounded-[1.75rem] border p-5 sm:p-6 ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-200"}`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Vision AI Engine</p>
              <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold">Face Match Confidence</span>
              <span className="text-xs font-black text-indigo-500">{dashboardData.summary?.verificationRate ?? "0.0%"}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500" style={{width: dashboardData.summary?.verificationRate ?? "0%"}}></div>
            </div>
            <div className="flex items-center justify-between mt-4 mb-2">
              <span className="text-xs font-bold">Pending Workload</span>
              <span className="text-xs font-black text-blue-500">{dashboardData.summary?.pendingReview ?? 0}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{width: `${Math.min(((dashboardData.summary?.pendingReview ?? 0) / Math.max(dashboardData.summary?.totalApplicants ?? 1, 1)) * 100, 100)}%`}}></div>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 to-indigo-900 p-6 text-white shadow-2xl sm:p-8 lg:rounded-[2.5rem]">
            <FiShield size={80} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
            <h3 className="text-xl font-black italic uppercase leading-tight tracking-tighter">Compliance Mode</h3>
            <p className="text-indigo-100 text-[11px] font-medium mt-3 opacity-80 leading-relaxed">
                Interacting with user identity data. Session encryption is strictly enforced.
            </p>
            <button 
            onClick={() => navigate("/admin/logs")}
            className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md transition-all">
              Security Logs
            </button>
          </div>
        </div>
      </div>

      {/* RECENT APPLICATIONS TABLE - The Review Hub */}
      <div className={`rounded-[2rem] border p-5 sm:p-6 lg:rounded-[2.5rem] lg:p-8 ${isDark ? "bg-[#1a2b4b] border-slate-700 shadow-xl" : "bg-white border-slate-200"}`}>
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-3 text-base font-black uppercase italic sm:text-lg">
             <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
             KYC Review Queue
          </h2>
          <button className="w-fit text-[11px] font-black uppercase tracking-widest text-indigo-500 hover:underline">View All Queue</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="pb-5 font-black uppercase text-[10px] tracking-widest">Applicant</th>
                <th className="pb-5 font-black uppercase text-[10px] tracking-widest">PAN Status</th>
                <th className="pb-5 font-black uppercase text-[10px] tracking-widest">Face Score</th>
                <th className="pb-5 font-black uppercase text-[10px] tracking-widest">Result</th>
                <th className="pb-5 font-black uppercase text-[10px] tracking-widest text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {(dashboardData.recentQueue || []).map((user, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold block">{user.name}</span>
                          <span className="text-[10px] opacity-50">{user.pan}</span>
                        </div>
                    </div>
                  </td>
                  <td className="py-5 font-medium text-xs">{user.panStatus}</td>
                  <td className="py-5">
                    <div className="flex items-center gap-2">
                        <div className="w-12 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                             <div className={`h-full ${user.score === "0%" ? "bg-red-500" : user.score === "N/A" ? "bg-amber-500" : "bg-green-500"}`} style={{width: user.score === "N/A" ? "35%" : user.score}}></div>
                        </div>
                        <span className="text-[10px] font-black">{user.score}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border ${
                        user.status === "Verified" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                        user.status === "Rejected" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}>
                        {user.status}
                    </span>
                  </td>
                  <td className="py-5 text-right">
                    <button
                    onClick={() => navigate(`/admin/kyc-review/${user.id}`)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-indigo-600 hover:text-white'
                  }`}>

                      Review
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && (!dashboardData.recentQueue || dashboardData.recentQueue.length === 0) && (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-sm text-slate-400 font-medium">
                    No applications available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
