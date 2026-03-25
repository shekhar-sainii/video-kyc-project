import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiArrowLeft, FiCheckCircle, FiCreditCard, FiShield, FiUser } from "react-icons/fi";
import Swal from "sweetalert2";
import kycService from "../../../services/kycService";
import BeautifulLoader from "../../../components/common/BeautifulLoader";


const API_BASE_URL =
  import.meta.env.VITE_AUTH_SERVICE_URL?.replace(/\/api\/v1\/?$/, "") || "";

const toAssetUrl = (value) => {
  if (!value) return null;
  if (
    value.startsWith("data:") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  const normalized = value.replace(/^src\/uploads\//, "uploads/");
  const path = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
};

const formatSubmittedAt = (value) => {
  if (!value) return "N/A";

  return new Date(value).toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminKYCReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const response = await kycService.getAdminApplicationDetail(id);
        setData(response?.data?.data || null);
      } catch (error) {
        const message =
          error?.response?.data?.message || "Failed to load KYC application.";
        Swal.fire("Error", message, "error").then(() => {
          navigate("/admin/kyc-queue");
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchApplication();
  }, [id, navigate]);

  const viewData = useMemo(() => {
    if (!data) return null;

    return {
      applicant: data.applicant?.name || "Unknown User",
      email: data.applicant?.email || "No email",
      submittedAt: formatSubmittedAt(data.submittedAt),
      panNumber: data.panNumber || "N/A",
      panResult:
        data.panMatch === null ? "Pending" : data.panMatch ? "Matched" : "Mismatch",
      faceScore: data.faceMatchScore,
      faceLabel:
        data.faceMatch === null ? "Verification Pending" : "Biometric Similarity Found",
      reviewNote: data.verificationMessage || "Awaiting verification result",
      status: data.status || "Pending",
      uploadedPhoto: toAssetUrl(data.uploadedPhoto),
      selfieImage: toAssetUrl(data.selfieImage),
      panCardImage: toAssetUrl(data.panCardImage),
      signature: toAssetUrl(data.signature),
    };
  }, [data]);

  if (loading) {
    return <BeautifulLoader text="Accessing Secure Vault..." />;
  }


  if (!viewData) {
    return null;
  }

  return (
    <div
      className={`min-h-screen px-4 py-6 transition-all sm:px-6 sm:py-8 lg:py-10 ${
        isDark ? "bg-[#0f172a] text-white" : "bg-[#f8fafd] text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between lg:mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100"
          >
            <FiArrowLeft /> Back to Queue
          </button>
          <div
            className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
              isDark
                ? "bg-slate-800 text-slate-300 border border-slate-700"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            Auto Verification Review
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-6">
            <div
              className={`rounded-[2rem] border-2 p-5 sm:p-6 lg:rounded-[2.5rem] lg:p-8 ${
                isDark
                  ? "bg-[#1a2b4b] border-slate-700"
                  : "bg-white border-slate-100 shadow-sm"
              }`}
            >
              <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-6">
                Applicant Info
              </h3>
              <div className="mb-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-2xl font-black">
                  {viewData.applicant.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tighter sm:text-xl">
                    {viewData.applicant}
                  </h2>
                  <p className="text-xs opacity-50 font-medium">{viewData.email}</p>
                </div>
              </div>
              <div className="space-y-4 pt-6 border-t border-slate-500/10">
                <InfoRow label="Application ID" value={id} />
                <InfoRow label="Submitted" value={viewData.submittedAt} />
                <InfoRow label="Status" value={viewData.status} />
                <InfoRow label="PAN Entered" value={viewData.panNumber} />
                <div className="flex justify-between items-center gap-4">
                  <p className="text-[10px] font-black uppercase opacity-40">OCR Result</p>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      viewData.panResult === "Matched"
                        ? "bg-green-500/10 text-green-500"
                        : viewData.panResult === "Mismatch"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    {viewData.panResult.toUpperCase()}
                  </span>
                </div>
                <InfoRow label="Review Note" value={viewData.reviewNote} />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] bg-indigo-600 p-6 text-white shadow-2xl sm:p-8 lg:rounded-[2.5rem]">
              <FiShield className="absolute -right-4 -bottom-4 opacity-10" size={100} />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">
                AI Vision Score
              </p>
              <h2 className="text-4xl font-black italic sm:text-5xl">
                {viewData.faceScore === null ? "N/A" : `${viewData.faceScore}%`}
              </h2>
              <p className="text-xs font-bold mt-4 text-indigo-100">
                {viewData.faceLabel}
              </p>
              <div className="mt-6 h-1.5 w-full bg-white/10 rounded-full">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${viewData.faceScore ?? 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div
              className={`rounded-[2rem] border-2 p-5 sm:p-6 lg:rounded-[2.5rem] lg:p-8 ${
                isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100"
              }`}
            >
              <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <FiUser /> Face Comparison (Form vs Live)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase text-center opacity-40 tracking-widest">
                    Original Upload
                  </p>
                  <ReviewImage src={viewData.uploadedPhoto} alt="Selfie" />
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase text-center opacity-40 tracking-widest">
                    Live Session Capture
                  </p>
                  <ReviewImage src={viewData.selfieImage} alt="Live" activeBorder />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              <div
                className={`rounded-[1.75rem] border-2 p-5 sm:p-6 lg:rounded-[2rem] ${
                  isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100"
                }`}
              >
                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FiCreditCard /> PAN Document
                </h3>
                <ReviewImage src={viewData.panCardImage} alt="PAN" wide />
              </div>
              <div
                className={`rounded-[1.75rem] border-2 p-5 sm:p-6 lg:rounded-[2rem] ${
                  isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100"
                }`}
              >
                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FiCheckCircle /> Signature
                </h3>
                <div className="bg-white rounded-2xl h-40 flex items-center justify-center p-4">
                  <ReviewImage src={viewData.signature} alt="Signature" contain />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center gap-4">
    <p className="text-[10px] font-black uppercase opacity-40">{label}</p>
    <p className="text-xs font-bold text-right">{value}</p>
  </div>
);

const ReviewImage = ({ src, alt, activeBorder = false, wide = false, contain = false }) => {
  if (!src) {
    return (
      <div
        className={`w-full ${wide ? "h-40" : "aspect-square"} rounded-[2rem] border-2 border-dashed border-slate-300/40 flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-50/40`}
      >
        Not available
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`w-full ${wide ? "h-40" : "aspect-square"} ${
        contain ? "object-contain" : "object-cover"
      } rounded-[2rem] border-4 ${
        activeBorder ? "border-indigo-600 shadow-xl" : "border-slate-500/5 shadow-lg"
      }`}
    />
  );
};

export default AdminKYCReview;
