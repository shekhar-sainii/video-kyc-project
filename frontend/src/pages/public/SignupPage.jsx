import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiChevronRight,
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiShield,
  FiUser,
  FiVideo,
} from "react-icons/fi";
import Swal from "sweetalert2";
import authService from "../../services/authService";

const SignupPage = () => {
  const navigate = useNavigate();
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (form.name.trim().length < 3) {
      setError("Name must be at least 3 characters");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await authService.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      await Swal.fire({
        icon: "success",
        title: "Account created",
        text: "Please verify your email before logging in.",
        confirmButtonColor: "#4f46e5",
        background: isDark ? "#1a2b4b" : "#fff",
        color: isDark ? "#fff" : "#1a2b4b",
      });

      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        isDark ? "bg-[#0f172a]" : "bg-[#f4f7fe]"
      }`}
    >
      <div
        className={`flex w-full max-w-5xl overflow-hidden rounded-[2.5rem] shadow-2xl border ${
          isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100"
        }`}
      >
        <div className="hidden md:flex md:w-5/12 relative bg-indigo-600 p-12 text-white flex-col justify-between">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
              <FiShield size={28} className="text-white" />
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-6 leading-tight">
              Create Your <br /> Secure <br /> Access.
            </h2>
            <div className="space-y-6 text-indigo-100">
              <div className="flex items-center gap-3">
                <FiVideo className="text-white" />
                <span className="text-sm font-semibold italic">
                  Access the full Video KYC journey
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FiCheckCircle className="text-white" />
                <span className="text-sm font-semibold italic">
                  Email verification and protected identity flow
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 pt-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">
              FinVerify Account Access
            </p>
          </div>

          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="w-full md:w-7/12 p-8 lg:p-16">
          <div className="mb-12 text-center md:text-left">
            <h1
              className={`text-3xl font-black mb-2 tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Create Account
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Register first, then complete your KYC from the dashboard
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                Full Name
              </label>
              <div className="relative group">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500"
                      : "bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-600"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                Email Address
              </label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500"
                      : "bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-600"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                Password
              </label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-4 rounded-2xl border-2 outline-none transition-all ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500"
                      : "bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-600"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                Confirm Password
              </label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-4 rounded-2xl border-2 outline-none transition-all ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500"
                      : "bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-600"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                <p className="text-red-500 text-xs font-bold tracking-tight">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 group transition-all disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <FiChevronRight className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center mt-10 text-xs font-bold text-slate-500 uppercase tracking-tight">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-black hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
