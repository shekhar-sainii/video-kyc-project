import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FiMail, FiArrowLeft, FiSend, FiShield } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import Swal from "sweetalert2";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      await authService.forgotPassword(email);
      
      Swal.fire({
        icon: 'success',
        title: 'Recovery Link Sent',
        text: 'A password reset link has been dispatched to your corporate email.',
        confirmButtonColor: '#2563eb',
        background: isDark ? '#1a2b4b' : '#fff',
        color: isDark ? '#fff' : '#1a2b4b'
      }).then(() => {
        navigate("/login");
      });

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Delivery Failed',
        text: err?.response?.data?.message || "Unable to send recovery email.",
        confirmButtonColor: '#2563eb'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDark ? "bg-[#0f172a]" : "bg-[#f8fafd]"}`}>
      
      <div className={`w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl border transition-all ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100"}`}>
        
        {/* Navigation Back */}
        <button 
          onClick={() => navigate(-1)} 
          className={`mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? "text-slate-500 hover:text-blue-400" : "text-slate-400 hover:text-blue-600"}`}
        >
          <FiArrowLeft /> Return to Login
        </button>

        <div className="text-center mb-10">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
            <FiShield size={36} />
          </div>
          <h1 className={`text-2xl font-black tracking-tight mb-2 ${isDark ? "text-white" : "text-[#1a2b4b]"}`}>
            Account Recovery
          </h1>
          <p className={`text-xs font-medium leading-relaxed px-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Enter your work email address below to receive an encrypted reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Registered Email
            </label>
            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all ${
                  isDark 
                  ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                  : "bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-600"
                }`}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Decrypting..." : <>Dispatch Link <FiSend /></>}
          </button>
        </form>

        <div className="mt-10 text-center">
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-30 ${isDark ? "text-white" : "text-black"}`}>
              Secure Identity Management
            </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;