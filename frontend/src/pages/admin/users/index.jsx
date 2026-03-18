import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Html from "./Html";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiUsers, FiFilter, FiDownload } from "react-icons/fi";

// Mock Data updated for Video KYC context
const DUMMY_APPLICANTS = [
  { _id: "65a1b2c3d4e1", name: "Shekhar Saini", email: "shekhar@dev.com", status: "Verified", pan: "ABCDE1234F", score: 98, submittedAt: "2026-03-15" },
  { _id: "65a1b2c3d4e2", name: "Rahul Sharma", email: "rahul.s@gmail.com", status: "Pending", pan: "BCDEF5678G", score: 45, submittedAt: "2026-03-16" },
  { _id: "65a1b2c3d4e3", name: "Anita Desai", email: "anita.d@outlook.com", status: "Rejected", pan: "XYWZA9012Z", score: 12, submittedAt: "2026-03-14" },
  { _id: "65a1b2c3d4e4", name: "James Bond", email: "007@mi6.gov", status: "Pending", pan: "JKLM0070M", score: 88, submittedAt: "2026-03-17" },
];

const AdminUsers = () => {
  const [applicants, setApplicants] = useState([]);
  const navigate = useNavigate();
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalUsers: 4,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApplicants();
  }, [pagination.currentPage]);

  const fetchApplicants = async () => {
    setLoading(true);
    // Simulating API call to /api/kyc/applications
    setTimeout(() => {
      setApplicants(DUMMY_APPLICANTS);
      setLoading(false);
    }, 800);
  };

  const onUpdateStatus = async (user) => {
    const { value: status } = await Swal.fire({
      title: 'Final Decision',
      text: `Update KYC status for ${user.name}`,
      input: 'select',
      inputOptions: {
        'Pending': 'Keep Pending',
        'Verified': 'Approve (Verified)',
        'Rejected': 'Reject Application'
      },
      inputValue: user.status,
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      background: isDark ? '#1a2b4b' : '#fff',
      color: isDark ? '#fff' : '#1a2b4b',
    });

    if (status) {
      setApplicants(prev => prev.map(u => u._id === user._id ? { ...u, status } : u));
      Swal.fire({ icon: 'success', title: `Status: ${status}`, timer: 1500, showConfirmButton: false });
    }
  };

  const onView = (user) => navigate(`/admin/kyc-review/${user._id}`);

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className={`text-3xl font-black tracking-tight uppercase italic ${isDark ? "text-white" : "text-slate-900"}`}>
            Identity Directory
          </h1>
          <p className={`text-sm font-medium mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Review digital identity submissions and AI verification scores.
          </p>
        </div>
        <div className="flex gap-3">
          <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-bold text-xs uppercase tracking-widest transition-all ${isDark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-slate-100 text-slate-600"}`}>
            <FiDownload /> Export CSV
          </button>
          <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all">
            Compliance Audit
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <Html
        data={applicants}
        loading={loading}
        pagination={pagination}
        onView={onView}
        onUpdateStatus={onUpdateStatus}
        onPageChange={(page) =>
          setPagination((prev) => ({ ...prev, currentPage: page }))
        }
      />
    </div>
  );
};

export default AdminUsers;