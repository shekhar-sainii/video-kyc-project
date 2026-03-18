import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import adminService from "../../../services/adminService";
import { FiArrowLeft, FiUser, FiMail, FiShield, FiCalendar, FiActivity } from "react-icons/fi";

const UserView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isDark = useSelector((state) => state.theme.mode === "dark");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      // ✅ Using specific API call instead of filtering local list
      const res = await adminService.getUserById(id);
      setUser(res.data.data);
    } catch (err) {
      console.error("Fetch user error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-[#F84464] animate-pulse font-bold">
      Loading User Details...
    </div>
  );
  
  if (!user) return (
    <div className="p-12 text-center text-gray-500">User not found or deleted.</div>
  );

  return (
    <div className={`max-w-4xl mx-auto p-4 md:p-8 transition-colors duration-300 ${isDark ? "text-gray-200" : "text-gray-900"}`}>
      
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className={`flex items-center gap-2 text-sm font-bold mb-8 transition-colors hover:text-[#F84464] ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        <FiArrowLeft size={18} />
        BACK TO USERS
      </button>

      {/* PROFILE HEADER CARD */}
      <div className={`rounded-3xl shadow-xl overflow-hidden border mb-8 ${isDark ? "bg-[#1f2533] border-gray-700" : "bg-white border-gray-100"}`}>
        <div className="h-24 bg-gradient-to-r from-[#F84464] to-[#d63a56]" />
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-2xl border-4 ${isDark ? "bg-gray-800 border-[#1f2533]" : "bg-gray-400 border-white"}`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${user.isBlocked ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-green-500/10 text-green-500 border border-green-500/20"}`}>
              {user.isBlocked ? "Blocked Account" : "Active Member"}
            </div>
          </div>

          <div className="mt-6">
            <h1 className="text-3xl font-black tracking-tight">{user.name}</h1>
            <p className="opacity-60 text-sm font-medium">{user.email}</p>
          </div>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ACCOUNT INFO */}
        <div className={`p-6 rounded-3xl border ${isDark ? "bg-[#1f2533] border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <FiUser className="text-[#F84464]" /> Account Details
          </h3>
          <div className="space-y-6">
            <InfoItem label="Role" value={user.role} icon={<FiShield />} isBadge />
            <InfoItem label="Auth Provider" value={user.provider || "Local"} icon={<FiActivity />} />
            <InfoItem label="Created At" value={new Date(user.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })} icon={<FiCalendar />} />
          </div>
        </div>

        {/* STATS / ACTIVITY (Mock data for BMS feel) */}
        <div className={`p-6 rounded-3xl border ${isDark ? "bg-[#1f2533] border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <FiActivity className="text-[#F84464]" /> Platform Activity
          </h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center p-3 rounded-2xl bg-gray-500/5">
                <span className="text-sm font-medium opacity-70">Total Bookings</span>
                <span className="font-black text-[#F84464]">12</span>
             </div>
             <div className="flex justify-between items-center p-3 rounded-2xl bg-gray-500/5">
                <span className="text-sm font-medium opacity-70">Loyalty Points</span>
                <span className="font-black text-blue-500">450</span>
             </div>
             <p className="text-[11px] opacity-40 italic mt-4">
               *Activity stats are calculated based on the last 12 months of cinema bookings.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

// UI REUSABLE COMPONENT
const InfoItem = ({ label, value, icon, isBadge }) => (
  <div className="flex items-center gap-4">
    <div className="text-lg opacity-40">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{label}</p>
      {isBadge ? (
        <span className="text-sm font-black text-[#F84464] uppercase">{value}</span>
      ) : (
        <p className="text-sm font-semibold">{value}</p>
      )}
    </div>
  </div>
);

export default UserView;