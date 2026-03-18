import React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

import StatsCard from "./StatsCard";
import { 
  FiUsers, FiVideo, FiShield, FiCheckCircle, 
  FiActivity, FiZap, FiAlertCircle, FiArrowUpRight, FiSearch
} from "react-icons/fi";

// Mock data: KYC Applications Volume
const KYC_VOLUME_DATA = [
  { name: 'Mon', apps: 120 }, { name: 'Tue', apps: 150 },
  { name: 'Wed', apps: 200 }, { name: 'Thu', apps: 180 },
  { name: 'Fri', apps: 250 }, { name: 'Sat', apps: 90 },
  { name: 'Sun', apps: 70 },
];

const Dashboard = () => {
  const isDark = useSelector((state) => state.theme.mode === "dark");

  return (
    <div className={`p-8 space-y-8 min-h-screen transition-colors duration-300
        ${isDark ? "bg-[#0f172a] text-gray-200" : "bg-[#f8fafd] text-[#1a2b4b]"}
      `}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">Compliance Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium">Monitoring real-time Identity Verifications & AI Vision Scores.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1">
             <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input type="text" placeholder="Search PAN/Application ID..." className={`pl-10 pr-4 py-2 rounded-xl border text-sm w-full outline-none focus:border-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`} />
          </div>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition">
            Reports
          </button>
        </div>
      </div>

      {/* STATS GRID - KYC Specific Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Applicants" value="1,284" icon={FiUsers} color="indigo" trend="+12%" />
        <StatsCard title="Pending Review" value="42" icon={FiActivity} color="orange" trend="High" />
        <StatsCard title="AI Verification Rate" value="96.2%" icon={FiZap} color="green" trend="Stable" />
        <StatsCard title="Security Incidents" value="0" icon={FiShield} color="red" trend="Safe" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART - Application Traffic */}
        <div className={`lg:col-span-2 rounded-[2.5rem] p-8 border transition-all
          ${isDark ? "bg-[#1a2b4b] border-slate-700 shadow-2xl" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <FiActivity className="text-indigo-500" /> Verification Velocity
            </h2>
            <div className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg text-[10px] font-black uppercase">Live Updates</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={KYC_VOLUME_DATA}>
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
          <div className={`rounded-[2rem] p-6 border ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-200"}`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Vision AI Engine</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold">Face Match Confidence</span>
              <span className="text-xs font-black text-indigo-500">98.4%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500" style={{width: '98%'}}></div>
            </div>
            <div className="flex items-center justify-between mt-4 mb-2">
              <span className="text-xs font-bold">PAN OCR Accuracy</span>
              <span className="text-xs font-black text-blue-500">94.1%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{width: '94%'}}></div>
            </div>
          </div>
          
          <div className="rounded-[2.5rem] p-8 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white shadow-2xl relative overflow-hidden">
            <FiShield size={80} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
            <h3 className="text-xl font-black italic uppercase leading-tight tracking-tighter">Compliance Mode</h3>
            <p className="text-indigo-100 text-[11px] font-medium mt-3 opacity-80 leading-relaxed">
                Interacting with user identity data. Session encryption is strictly enforced.
            </p>
            <button className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md transition-all">
              Security Logs
            </button>
          </div>
        </div>
      </div>

      {/* RECENT APPLICATIONS TABLE - The Review Hub */}
      <div className={`p-8 rounded-[2.5rem] border ${isDark ? "bg-[#1a2b4b] border-slate-700 shadow-xl" : "bg-white border-slate-200"}`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-black uppercase italic flex items-center gap-3">
             <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
             KYC Review Queue
          </h2>
          <button className="text-indigo-500 text-xs font-black uppercase tracking-widest hover:underline">View All Queue</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
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
              {[
                { name: "Shekhar Saini", pan: "Match", score: "98%", status: "Pending" },
                { name: "John Doe", pan: "Match", score: "94%", status: "Verified" },
                { name: "Amit Kumar", pan: "Mismatch", score: "12%", status: "Rejected" },
              ].map((user, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs">
                            {user.name.charAt(0)}
                        </div>
                        <span className="font-bold">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-5 font-medium text-xs">{user.pan}</td>
                  <td className="py-5">
                    <div className="flex items-center gap-2">
                        <div className="w-12 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                             <div className="h-full bg-green-500" style={{width: user.score}}></div>
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
                    <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-indigo-600 hover:text-white'}`}>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;