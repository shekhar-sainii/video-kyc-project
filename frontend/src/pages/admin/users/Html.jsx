import React from "react";
import Table from "../../../components/Table";
import { FiShield, FiUserCheck } from "react-icons/fi";
import { useSelector } from "react-redux";

const Html = ({ data, loading, pagination, onView, onUpdateStatus, onPageChange, onLimitChange }) => {

  const isDark = useSelector((state) => state.theme.mode === "dark");

  const columns = [
    {
      key: "applicant",
      name: "Applicant Identity",
      render: (row) => (
        <div className="flex items-center gap-4">
          {row.profileImage ? (
            <img
              src={row.profileImage}
              alt={row.name}
              className="w-10 h-10 rounded-xl object-cover border border-indigo-500/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-xs border border-indigo-500/20">
              {row.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className={`font-black text-sm tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>{row.name}</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      name: "Account Status",
      render: (row) => (
        <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${
          row.isActive
            ? "bg-green-500/10 border-green-500/20 text-green-500"
            : "bg-red-500/10 border-red-500/20 text-red-500"
        }`}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "role",
      name: "Role",
      render: (row) => (
        <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${
          row.role === "admin"
            ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
            : "bg-slate-500/10 border-slate-500/20 text-slate-500"
        }`}>
          {row.role}
        </span>
      ),
    },
    {
      key: "verification",
      name: "Email Verified",
      render: (row) => (
        <span className={`text-xs font-bold ${
          row.isEmailVerified ? "text-green-500" : isDark ? "text-slate-400" : "text-slate-500"
        }`}>
          {row.isEmailVerified ? "Verified" : "Pending"}
        </span>
      ),
    },
    {
      key: "date",
      name: "Joined On",
      render: (row) => (
        <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A"}
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
            title={row.isActive ? "Deactivate User" : "Activate User"}
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
        isLoading={loading}
        columns={columns}

        page={pagination?.currentPage || 1}
        count={pagination?.limit || 10}
        total={pagination?.totalUsers || 0}
        result={(e) => {
          if (e.event === "page") onPageChange(e.value);
          if (e.event === "count") onLimitChange(e.value);
        }}
      />
    </div>
  );
};

export default Html;
