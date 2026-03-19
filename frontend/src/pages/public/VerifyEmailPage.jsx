import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiAlertCircle, FiCheckCircle, FiLoader, FiMail, FiShield } from "react-icons/fi";
import authService from "../../services/authService";

const VerifyEmailPage = () => {
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email token...");
  const verificationStartedRef = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing or invalid.");
      return;
    }

    if (verificationStartedRef.current) {
      return;
    }

    verificationStartedRef.current = true;

    const runVerification = async () => {
      try {
        const response = await authService.verifyEmail(token);
        setStatus("success");
        setMessage(response?.data?.message || "Email verified successfully.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error?.response?.data?.message || "This verification link is invalid or has expired."
        );
      }
    };

    void runVerification();
  }, [searchParams]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        isDark ? "bg-[#0f172a]" : "bg-[#f4f7fe]"
      }`}
    >
      <div
        className={`w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl border ${
          isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100"
        } md:grid md:grid-cols-[1.05fr_1fr]`}
      >
        <div className="hidden md:flex bg-indigo-600 text-white p-12 flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
              <FiShield size={28} />
            </div>
            <h1 className="text-4xl font-black tracking-tight leading-tight mb-6">
              Email <br /> Verification <br /> Center.
            </h1>
            <div className="space-y-5 text-indigo-100">
              <div className="flex items-center gap-3">
                <FiMail />
                <span className="text-sm font-semibold italic">Secure account activation</span>
              </div>
              <div className="flex items-center gap-3">
                <FiCheckCircle />
                <span className="text-sm font-semibold italic">Continue to login after confirmation</span>
              </div>
            </div>
          </div>
          <p className="relative z-10 text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">
            FinVerify Identity Access
          </p>
          <div className="absolute -top-10 -right-8 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="p-8 md:p-14 flex items-center">
          <div className="w-full">
            <div className="mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-3">
                Account Status
              </p>
              <h2 className={`text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                {status === "loading" && "Verifying Email"}
                {status === "success" && "Email Verified"}
                {status === "error" && "Verification Failed"}
              </h2>
            </div>

            <div
              className={`rounded-[2rem] border-2 p-8 ${
                isDark ? "bg-slate-900/40 border-slate-700" : "bg-slate-50 border-slate-100"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                  status === "success"
                    ? "bg-green-500/10 text-green-500"
                    : status === "error"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-indigo-500/10 text-indigo-500"
                }`}
              >
                {status === "loading" && <FiLoader className="animate-spin" size={30} />}
                {status === "success" && <FiCheckCircle size={30} />}
                {status === "error" && <FiAlertCircle size={30} />}
              </div>

              <p className={`text-sm leading-7 font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                {message}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest transition-all"
                >
                  Go To Login
                </Link>
                <Link
                  to="/register"
                  className={`inline-flex items-center justify-center px-6 py-3 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${
                    isDark
                      ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Back To Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
