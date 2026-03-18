import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../../features/auth/authSlice";
import authService from "../../services/authService";
import { setTokens } from "../../utils/token";
import { useNavigate, Link } from "react-router-dom";

// Icons (Tasks ke hisaab se updated)
import { FiMail, FiLock, FiChevronRight, FiVideo, FiShield, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError("All fields are required");

    try {
      setLoading(true);
      setError("");
      const res = await authService.login(form);
      const { user, accessToken, refreshToken } = res.data.data;
      setTokens(accessToken, refreshToken, user.role);
      dispatch(loginSuccess({ user, role: user.role }));

      // Intern Assessment Flow: Redirecting to Application Form or List
      if (user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard"); // Yahan user apni KYC application dekhega
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 
      ${isDark ? "bg-[#0f172a]" : "bg-[#f4f7fe]"}`}>

      <div className={`flex w-full max-w-5xl overflow-hidden rounded-[2.5rem] shadow-2xl border 
        ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100"}`}>

        {/* LEFT SIDE: FinTech / Video KYC Branding */}
        <div className="hidden md:flex md:w-5/12 relative bg-indigo-600 p-12 text-white flex-col justify-between">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
              <FiShield size={28} className="text-white" />
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-6 leading-tight">
              Secure <br /> Identity <br /> Verification.
            </h2>
            <div className="space-y-6 text-indigo-100">
              <div className="flex items-center gap-3">
                <FiVideo className="text-white" />
                <span className="text-sm font-semibold italic">Live AI-Guided Sessions</span>
              </div>
              <div className="flex items-center gap-3">
                <FiCheckCircle className="text-white" />
                <span className="text-sm font-semibold italic">Real-time PAN & Face Matching</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 pt-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">
              FinTech Assessment Portal v1.0
            </p>
          </div>

          {/* Abstract pattern to give a professional look */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute -top-10 -right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="w-full md:w-7/12 p-8 lg:p-16">
          <div className="mb-12 text-center md:text-left">
            <h1 className={`text-3xl font-black mb-2 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              User Login
            </h1>
            <p className="text-slate-400 text-sm font-medium">Log in to complete your Video KYC process</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Corporate Email</label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all
                    ${isDark ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-600"}`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Security Password</label>
                <Link to="/forgot-password" className="text-[10px] font-bold text-indigo-600 hover:underline">Reset?</Link>
              </div>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-4 rounded-2xl border-2 outline-none transition-all
                ${isDark ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-600"}`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                <p className="text-red-500 text-xs font-bold tracking-tight">⚠️ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 group transition-all"
            >
              {loading ? "Authenticating..." : "Access KYC Portal"}
              {!loading && <FiChevronRight className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8 opacity-40">
            <div className={`flex-1 h-[1px] ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital ID</span>
            <div className={`flex-1 h-[1px] ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
          </div>

          {/* Social login kept for modern UI feel */}
          <div
            className={`flex items-center justify-center gap-3 py-3.5 border-2 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm
              ${isDark ? "border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-white" : "border-slate-100 bg-white hover:bg-slate-50 text-slate-700"}`}
          >
            <FcGoogle size={22} />
            <span className="text-sm font-bold">Sign in with Google</span>
          </div>

          <p className="text-center mt-10 text-xs font-bold text-slate-500 uppercase tracking-tight">
            Need an account? <Link to="/register" className="text-indigo-600 font-black hover:underline">Apply for KYC</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;