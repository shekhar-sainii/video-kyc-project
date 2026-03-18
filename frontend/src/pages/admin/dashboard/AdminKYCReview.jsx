import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  FiShield, FiUser, FiCreditCard, FiCheckCircle, 
  FiXCircle, FiArrowLeft, FiAlertTriangle, FiDownload 
} from "react-icons/fi";
import Swal from "sweetalert2";

const AdminKYCReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isDark = useSelector((state) => state.theme.mode === "dark");

  // Mock Data: Ise aap backend GET /api/kyc/applications/:id se fetch karenge
  const [data] = useState({
    applicant: "Shekhar Saini",
    email: "shekhar@example.com",
    pan_entered: "ABCDE1234F",
    pan_extracted: "ABCDE1234F",
    face_match_score: 98.4,
    submitted_at: "15 Mar 2026, 10:30 AM",
    selfie_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=500&auto=format", // Original Upload
    live_capture_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=500&auto=format", // Live Session Capture
    pan_card_url: "https://images.livemint.com/img/2019/07/11/600x338/PAN_1562829377402.jpg",
    signature_url: "https://upload.wikimedia.org/wikipedia/commons/7/7d/John_Hancock_signature.png"
  });

  const handleDecision = (status) => {
    Swal.fire({
      title: `Confirm ${status}?`,
      text: `Are you sure you want to mark this application as ${status}?`,
      icon: status === 'Approved' ? 'success' : 'warning',
      showCancelButton: true,
      confirmButtonColor: status === 'Approved' ? '#10b981' : '#ef4444',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Success", `KYC has been ${status}`, "success");
        navigate("/admin");
      }
    });
  };

  return (
    <div className={`min-h-screen py-10 px-6 transition-all ${isDark ? "bg-[#0f172a] text-white" : "bg-[#f8fafd] text-slate-900"}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100">
            <FiArrowLeft /> Back to Queue
          </button>
          <div className="flex gap-4">
             <button onClick={() => handleDecision('Rejected')} className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                Reject Application
             </button>
             <button onClick={() => handleDecision('Approved')} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-500/20 hover:bg-green-700 transition-all">
                Approve KYC
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Applicant Summary */}
          <div className="space-y-6">
            <div className={`p-8 rounded-[2.5rem] border-2 ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}>
               <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-6">Applicant Info</h3>
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-2xl font-black">
                    {data.applicant.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tighter">{data.applicant}</h2>
                    <p className="text-xs opacity-50 font-medium">{data.email}</p>
                  </div>
               </div>
               <div className="space-y-4 pt-6 border-t border-slate-500/10">
                  <InfoRow label="Application ID" value={id || "KYC-9921"} />
                  <InfoRow label="Submitted" value={data.submitted_at} />
                  <InfoRow label="PAN Entered" value={data.pan_entered} />
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase opacity-40">OCR Result</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${data.pan_entered === data.pan_extracted ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                        {data.pan_entered === data.pan_extracted ? "MATCHED" : "MISMATCH"}
                    </span>
                  </div>
               </div>
            </div>

            {/* AI Vision Card */}
            <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl relative overflow-hidden">
               <FiShield className="absolute -right-4 -bottom-4 opacity-10" size={100} />
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">AI Vision Score</p>
               <h2 className="text-5xl font-black italic">{data.face_match_score}%</h2>
               <p className="text-xs font-bold mt-4 text-indigo-100">Biometric Similarity Found</p>
               <div className="mt-6 h-1.5 w-full bg-white/10 rounded-full">
                  <div className="h-full bg-white rounded-full" style={{width: `${data.face_match_score}%`}}></div>
               </div>
            </div>
          </div>

          {/* RIGHT: Document Comparison Hub */}
          <div className="lg:col-span-2 space-y-8">
             
             {/* Face Comparison View */}
             <div className={`p-8 rounded-[2.5rem] border-2 ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100"}`}>
                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <FiUser /> Face Comparison (Form vs Live)
                </h3>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase text-center opacity-40 tracking-widest">Original Upload</p>
                        <img src={data.selfie_url} className="w-full aspect-square object-cover rounded-[2rem] border-4 border-slate-500/5 shadow-lg" alt="Selfie" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase text-center opacity-40 tracking-widest">Live Session Capture</p>
                        <img src={data.live_capture_url} className="w-full aspect-square object-cover rounded-[2rem] border-4 border-indigo-600 shadow-xl" alt="Live" />
                    </div>
                </div>
             </div>

             {/* PAN & Signature View */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={`p-6 rounded-[2rem] border-2 ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100"}`}>
                    <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FiCreditCard /> PAN Document
                    </h3>
                    <img src={data.pan_card_url} className="w-full h-40 object-cover rounded-2xl grayscale hover:grayscale-0 transition-all cursor-zoom-in" alt="PAN" />
                </div>
                <div className={`p-6 rounded-[2rem] border-2 ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100"}`}>
                    <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FiCheckCircle /> Signature
                    </h3>
                    <div className="bg-white rounded-2xl h-40 flex items-center justify-center p-4">
                        <img src={data.signature_url} className="max-h-full" alt="Signature" />
                    </div>
                </div>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
};

// Helper
const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <p className="text-[10px] font-black uppercase opacity-40">{label}</p>
        <p className="text-xs font-bold">{value}</p>
    </div>
);

export default AdminKYCReview;