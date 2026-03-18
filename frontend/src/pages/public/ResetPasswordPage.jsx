import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // useParams ki jagah useLocation
import { useSelector } from "react-redux";
import { FiLock, FiCheckCircle, FiShield, FiEye, FiEyeOff } from "react-icons/fi";
import authService from "../../services/authService";
import Swal from "sweetalert2";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // URL information lene ke liye
  const isDark = useSelector((state) => state.theme.mode === "dark");

  // --- QUERY PARAMETER SE TOKEN NIKALNA ---
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    
    // Check if token exists
    if (!token) {
      return Swal.fire("Error", "Recovery token is missing from the URL.", "error");
    }

    if (password !== confirmPassword) {
      return Swal.fire("Error", "Passwords do not match.", "error");
    }

    try {
      setLoading(true);
      // Backend expects { token, password }
      await authService.resetPassword({ token, password });
      
      Swal.fire({
        icon: 'success',
        title: 'Identity Secured',
        text: 'Your password has been successfully re-encrypted.',
        confirmButtonColor: '#2563eb'
      }).then(() => {
        navigate("/login");
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Request Failed',
        text: err?.response?.data?.message || "Invalid or expired token.",
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (val, field) => {
    if (field === "pass") setPassword(val);
    else setConfirmPassword(val);

    // Real-time matching feedback
    if (field === "confirm" && val !== password) {
        setError("Passwords mismatch");
    } else {
        setError("");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${isDark ? "bg-[#0f172a]" : "bg-[#f8fafd]"}`}>
      
      <div className={`w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl border transition-all ${isDark ? "bg-[#1a2b4b] border-slate-700 shadow-blue-900/20" : "bg-white border-slate-100 shadow-slate-200"}`}>
        
        <div className="text-center mb-10">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
            <FiShield size={36} />
          </div>
          <h1 className={`text-2xl font-black tracking-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
            Reset Password
          </h1>
          <p className={`text-xs font-medium leading-relaxed px-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Initialize new security credentials for your DocIntel workspace.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          
          <div className="space-y-2">
            <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>New Password</label>
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showPass ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value, "pass")}
                className={`w-full pl-12 pr-12 py-4 rounded-2xl border-2 outline-none transition-all ${
                  isDark 
                  ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                  : "bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-600"
                }`}
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
              >
                {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Confirm Identity</label>
            <div className="relative group">
              <FiCheckCircle className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-500' : 'text-slate-400'}`} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => handlePasswordChange(e.target.value, "confirm")}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all ${
                  error 
                  ? "border-red-500/50 bg-red-500/5" 
                  : isDark ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" : "bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-600"
                }`}
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">
                {error}
            </p>
          )}

          <button
            disabled={loading || error}
            className={`w-full py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
              error || !password 
              ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
            }`}
          >
            {loading ? "Re-encrypting..." : "Update Credentials"}
          </button>
        </form>

        <div className="mt-10 text-center">
            <p className={`text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ${isDark ? "text-white" : "text-black"}`}>
              End-to-End Encrypted Recovery
            </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;