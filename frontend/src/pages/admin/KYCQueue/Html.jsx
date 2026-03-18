import React from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from "recharts";
import { FiZap, FiBox, FiClock, FiShare2 } from "react-icons/fi";

const Html = ({ data, loading, isDark }) => {
  return (
    <div className="space-y-6">
      {/* Telemetry Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Total Requests" value="1.4M" change="+12%" icon={<FiZap />} isDark={isDark} />
        <MetricCard title="Tokens Consumed" value="42.8M" change="+5.4%" icon={<FiBox />} isDark={isDark} />
        <MetricCard title="Avg. Resp Time" value="1.2s" change="-10%" icon={<FiClock />} isDark={isDark} />
        <MetricCard title="Bandwidth" value="4.2TB" change="+22%" icon={<FiShare2 />} isDark={isDark} />
      </div>

      {/* Usage Wave Chart (Matching Mockup) */}
      <div className={`p-8 rounded-3xl border transition-all ${
        isDark ? "bg-[#1a2b4b] border-slate-700 shadow-2xl" : "bg-white border-slate-100 shadow-sm"
      }`}>
        <div className="flex items-center justify-between mb-8">
          <h3 className={`font-bold ${isDark ? "text-slate-100" : "text-[#1a2b4b]"}`}>Request Volume Trend</h3>
          <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Real-time Telemetry</span>
        </div>

        <div className="h-[350px] w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-blue-500 font-bold animate-pulse text-xs tracking-widest uppercase">
              Rendering Time-Series Data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#2d3748" : "#f1f5f9"} />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1e293b' : '#fff', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#usageGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

// Internal Helper for KPI Cards
const MetricCard = ({ title, value, change, icon, isDark }) => (
  <div className={`p-6 rounded-3xl border ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-lg ${isDark ? "bg-slate-800 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
        change.startsWith('+') ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
      }`}>
        {change}
      </span>
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className={`text-2xl font-black ${isDark ? "text-white" : "text-[#1a2b4b]"}`}>{value}</h3>
  </div>
);

export default Html;