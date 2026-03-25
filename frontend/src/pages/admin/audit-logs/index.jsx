import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { 
  FiShield, FiSearch, FiActivity, 
  FiLock, FiUser, FiAlertTriangle, FiDownload, 
  FiCheckCircle
} from "react-icons/fi";
import Table from "../../../components/Table";
import userService from "../../../services/userService";
import Swal from "sweetalert2";

const AuditLogs = () => {
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    totalEvents: 0,
    securityAlerts: 0,
    lastSync: "No logs yet",
    nodeStatus: "Healthy",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    const fetchSecurityLogs = async () => {
      try {
        setLoading(true);
        const res = await userService.getSecurityLogs({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch,
        });
        const payload = res?.data?.data || {};
        setLogs(payload.logs || []);
        setMetrics(payload.metrics || {});
        setPagination((prev) => ({
          ...prev,
          page: payload.pagination?.page || prev.page,
          limit: payload.pagination?.limit || prev.limit,
          total: payload.pagination?.total || 0,
        }));
      } catch (error) {
        const message = error?.response?.data?.message || "Failed to load security logs.";
        Swal.fire("Error", message, "error");
      } finally {
        setLoading(false);
      }
    };

    void fetchSecurityLogs();
  }, [pagination.page, pagination.limit, debouncedSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleExportCsv = () => {
    if (!logs.length) {
      Swal.fire("Info", "No audit logs available to export.", "info");
      return;
    }

    const headers = [
      "Action",
      "Target",
      "User",
      "Timestamp",
      "IP",
      "Method",
      "Severity",
    ];

    const escapeCsvValue = (value) => {
      const stringValue = String(value ?? "");
      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const rows = logs.map((log) => [
      log.action,
      log.target,
      log.user,
      log.timestamp,
      log.ip,
      log.method || "",
      log.status,
    ]);

    const csvContent = [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.setAttribute("download", `security-logs-${stamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: "event",
      name: "Event Protocol",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            row.status === 'Critical' ? "bg-red-500/10 text-red-500" :
            row.status === 'Warning' ? "bg-amber-500/10 text-amber-500" : "bg-indigo-500/10 text-indigo-500"
          }`}>
            <FiActivity size={14} />
          </div>
          <div className="flex flex-col">
            <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? "text-white" : "text-slate-900"}`}>
                {row.action}
            </span>
            <span className="text-[9px] font-bold text-slate-400">Target: {row.target}</span>
          </div>
        </div>
      ),
    },
    {
      key: "actor",
      name: "Actor / Source",
      render: (row) => (
        <div className="flex items-center gap-2">
          <FiUser className="text-slate-400" size={12} />
          <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>{row.user}</span>
        </div>
      ),
    },
    {
      key: "timestamp",
      name: "Timeline",
      render: (row) => (
        <div className="flex flex-col">
          <span className={`text-[10px] font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>{row.timestamp}</span>
          <span className="text-[9px] opacity-40 font-medium">IP: {row.ip} {row.method ? `• ${row.method}` : ""}</span>
        </div>
      ),
    },
    {
      key: "status",
      name: "Severity",
      render: (row) => (
        <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border ${
          row.status === 'Critical' ? "bg-red-500/10 border-red-500/20 text-red-500" :
          row.status === 'Warning' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
          "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
        }`}>
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-8 min-h-screen">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className={`text-3xl font-black tracking-tight uppercase italic ${isDark ? "text-white" : "text-slate-900"}`}>
            Security Logs
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
            <FiLock className="text-indigo-500" /> Immutable Audit Trail for FinVerify Compliance
          </p>
        </div>
        
        <div className="flex gap-3">
             <button
                onClick={handleExportCsv}
                disabled={loading || !logs.length}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-slate-100 text-slate-600 shadow-sm"
             }`}
             >
                <FiDownload /> Export Audit Trail
             </button>
        </div>
      </div>

      {/* --- LIVE STATUS WIDGETS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <LogMetric label="Total Events" value={String(metrics.totalEvents || 0)} icon={<FiActivity />} color="text-indigo-500" />
         <LogMetric label="Security Alerts" value={String(metrics.securityAlerts || 0)} icon={<FiAlertTriangle />} color="text-red-500" />
         <LogMetric label="Last Sync" value={metrics.lastSync || "No logs yet"} icon={<FiShield />} color="text-green-500" />
         <LogMetric label="Node Status" value={metrics.nodeStatus || "Healthy"} icon={<FiCheckCircle />} color="text-blue-500" />
      </div>

      {/* --- TABLE AREA --- */}
      <div className={`rounded-[2.5rem] border-2 overflow-hidden shadow-2xl transition-all ${
        isDark ? "bg-[#1a2b4b] border-slate-700 shadow-indigo-900/10" : "bg-white border-slate-100"
      }`}>
        <div className="p-6 border-b border-slate-500/10 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50">System Activity Stream</h3>
            <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                <input 
                    type="text" 
                    placeholder="Filter by Action/IP..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-xl border outline-none text-[10px] font-bold ${
                        isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-100"
                    }`}
                />
            </div>
        </div>
        <Table
          data={logs}
          columns={columns}
          count={pagination.limit}
          total={pagination.total}
          page={pagination.page}
          isLoading={loading}
          result={(event) => {
            if (event.event === "page") {
              setPagination((prev) => ({ ...prev, page: event.value }));
            }

            if (event.event === "count") {
              setPagination((prev) => ({
                ...prev,
                page: 1,
                limit: event.value,
              }));
            }
          }}
        />
      </div>

    </div>
  );
};

const LogMetric = ({ label, value, icon, color }) => {
    const isDark = useSelector((state) => state.theme.mode === "dark");
    return (
        <div className={`p-6 rounded-[2rem] border-2 flex items-center gap-4 ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100"}`}>
            <div className={`p-3 rounded-2xl bg-slate-500/5 ${color}`}>{icon}</div>
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                <h3 className={`text-xl font-black italic ${isDark ? "text-white" : "text-slate-900"}`}>{value}</h3>
            </div>
        </div>
    );
};

export default AuditLogs;
