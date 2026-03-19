import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Html from "./Html";
import { useSelector } from "react-redux";
import { FiDownload } from "react-icons/fi";
import userService from "../../../services/userService";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetchUsers();
  }, [pagination.currentPage, pagination.limit]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers({
        page: pagination.currentPage,
        limit: pagination.limit,
      });
      const payload = res?.data?.data || {};
      const rows = payload?.users || [];
      const nextPagination = payload?.pagination || {};

      setUsers(rows);
      setPagination((prev) => ({
        ...prev,
        currentPage: nextPagination.currentPage || prev.currentPage,
        limit: nextPagination.limit || prev.limit,
        totalUsers: nextPagination.totalUsers || 0,
      }));
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to load users.";
      Swal.fire("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  const onUpdateStatus = async (user) => {
    const actionLabel = user.isActive ? "Deactivate" : "Activate";
    const { isConfirmed } = await Swal.fire({
      title: `${actionLabel} User?`,
      text: `${actionLabel} ${user.name}'s account access.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: user.isActive ? "#ef4444" : "#16a34a",
      background: isDark ? "#1a2b4b" : "#fff",
      color: isDark ? "#fff" : "#1a2b4b",
      confirmButtonText: actionLabel,
    });

    if (isConfirmed) {
      try {
        setLoading(true);
        if (user.isActive) {
          await userService.deactivateUser(user.id);
        } else {
          await userService.activateUser(user.id);
        }

        await fetchUsers();
        Swal.fire({
          icon: "success",
          title: `${actionLabel}d`,
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        const message = error?.response?.data?.message || `Failed to ${actionLabel.toLowerCase()} user.`;
        Swal.fire("Error", message, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const onView = async (user) => {
    await Swal.fire({
      title: user.name,
      html: `
        <div style="text-align:left; line-height:1.8;">
          <div><strong>Email:</strong> ${user.email}</div>
          <div><strong>Role:</strong> ${user.role}</div>
          <div><strong>Email Verified:</strong> ${user.isEmailVerified ? "Yes" : "No"}</div>
          <div><strong>Status:</strong> ${user.isActive ? "Active" : "Inactive"}</div>
          <div><strong>Joined:</strong> ${user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}</div>
        </div>
      `,
      confirmButtonColor: "#4f46e5",
      background: isDark ? "#1a2b4b" : "#fff",
      color: isDark ? "#fff" : "#1a2b4b",
    });
  };

  const handleExportCsv = () => {
    void (async () => {
      try {
        const exportLimit = Math.min(Math.max(pagination.totalUsers || 1000, 10), 1000);
        const res = await userService.getAllUsers({ page: 1, limit: exportLimit });
        const exportUsers = res?.data?.data?.users || [];

        if (!exportUsers.length) {
          Swal.fire("Info", "No users available to export.", "info");
          return;
        }

        const headers = [
          "Name",
          "Email",
          "Role",
          "Status",
          "Email Verified",
          "Joined On",
        ];

        const escapeCsvValue = (value) => {
          const stringValue = String(value ?? "");
          return `"${stringValue.replace(/"/g, '""')}"`;
        };

        const rows = exportUsers.map((user) => [
          user.name,
          user.email,
          user.role,
          user.isActive ? "Active" : "Inactive",
          user.isEmailVerified ? "Verified" : "Pending",
          user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A",
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
        link.setAttribute("download", `admin-users-${stamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        const message = error?.response?.data?.message || "Failed to export users.";
        Swal.fire("Error", message, "error");
      }
    })();
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className={`text-3xl font-black tracking-tight uppercase italic ${isDark ? "text-white" : "text-slate-900"}`}>
            User Directory
          </h1>
          <p className={`text-sm font-medium mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Manage registered users, account status, and verification state.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCsv}
            disabled={loading || !users.length}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-slate-100 text-slate-600"}`}
          >
            <FiDownload /> Export CSV
          </button>
          {/* <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all">
            Compliance Audit
          </button> */}
        </div>
      </div>

      {/* Main Table Content */}
      <Html
        data={users}
        loading={loading}
        pagination={pagination}
        onView={onView}
        onUpdateStatus={onUpdateStatus}
        onPageChange={(page) =>
          setPagination((prev) => ({ ...prev, currentPage: page }))
        }
        onLimitChange={(limit) =>
          setPagination((prev) => ({ ...prev, currentPage: 1, limit }))
        }
      />
    </div>
  );
};

export default AdminUsers;
