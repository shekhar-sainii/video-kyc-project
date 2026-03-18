import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas"; // Signature pad ke liye
import { FiUser, FiMail, FiCreditCard, FiCamera, FiCheckCircle, FiTrash2, FiShield } from "react-icons/fi";
import Swal from "sweetalert2";

const SignupPage = () => {
  const navigate = useNavigate();
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const sigCanvas = useRef({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    pan_number: "",
    photo: null,
    photoPreview: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value.toUpperCase() });
    if (error) setError("");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({
        ...form,
        photo: file,
        photoPreview: URL.createObjectURL(file),
      });
    }
  };

  const clearSignature = () => sigCanvas.current.clear();

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. PAN Format Validation (ABCDE1234F)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(form.pan_number)) {
      return setError("Invalid PAN format (e.g., ABCDE1234F)");
    }

    // 2. Signature Validation
    if (sigCanvas.current.isEmpty()) {
      return setError("Digital signature is required");
    }

    // 3. Photo Validation
    if (!form.photo) {
      return setError("Please upload your photo");
    }

    try {
      setLoading(true);
      setError("");

      // Yahan aap backend API call karenge (/api/kyc/submit)
      // Signature ko base64 mein convert karne ke liye:
      // const signatureImage = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');

      Swal.fire({
        icon: 'success',
        title: 'Application Submitted!',
        text: 'Your KYC application is now pending review.',
        confirmButtonColor: '#4f46e5',
        background: isDark ? '#1a2b4b' : '#fff',
        color: isDark ? '#fff' : '#1a2b4b',
      }).then(() => navigate("/dashboard"));

    } catch (err) {
      setError("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 
      ${isDark ? "bg-[#0f172a]" : "bg-[#f4f7fe]"}`}>

      <div className={`flex flex-row-reverse w-full max-w-6xl overflow-hidden rounded-[2.5rem] shadow-2xl border 
        ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100"}`}>

        {/* LEFT SIDE: Info */}
        <div className="hidden lg:flex lg:w-4/12 relative bg-indigo-600 p-12 text-white flex-col justify-between">
          <div className="relative z-10">
            <h2 className="text-4xl font-black tracking-tight mb-8 leading-tight italic">
              KYC <br /> Application <br /> Portal.
            </h2>
            <div className="space-y-6 text-indigo-100">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg"><FiShield /></div>
                <p className="text-sm font-bold">Secure Data Encryption</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg"><FiCheckCircle /></div>
                <p className="text-sm font-bold">Instant Document OCR</p>
              </div>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-50">FinVerify Compliance v2.0</p>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="w-full lg:w-8/12 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
          <div className="mb-10">
            <h1 className={`text-3xl font-black mb-2 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Register for KYC</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Submit your digital identity details</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* PAN Number */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">PAN Card Number</label>
                <div className="relative group">
                  <FiCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" />
                  <input type="text" name="pan_number" maxLength={10} value={form.pan_number} onChange={handleChange} placeholder="ABCDE1234F" 
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all font-bold tracking-widest
                    ${isDark ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-600"}`} />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Profile Photo (Selfie)</label>
                <div className="flex items-center gap-4">
                  {form.photoPreview ? (
                    <div className="relative w-16 h-16">
                      <img src={form.photoPreview} className="w-full h-full object-cover rounded-xl border-2 border-indigo-500" alt="Preview" />
                      <button type="button" onClick={() => setForm({...form, photo: null, photoPreview: null})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><FiTrash2 size={10} /></button>
                    </div>
                  ) : (
                    <label className={`flex-1 flex items-center justify-center gap-3 py-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all
                      ${isDark ? "bg-slate-800 border-slate-700 text-slate-400 hover:border-indigo-500" : "bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-600"}`}>
                      <FiCamera /> <span className="text-xs font-bold">Upload Photo</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Signature Pad */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Digital Signature</label>
                <button type="button" onClick={clearSignature} className="text-[10px] font-bold text-red-500 hover:underline uppercase">Clear</button>
              </div>
              <div className={`border-2 border-dashed rounded-[2rem] overflow-hidden ${isDark ? "bg-white border-slate-700" : "bg-slate-50 border-slate-100"}`}>
                <SignatureCanvas ref={sigCanvas} penColor="black" canvasProps={{ className: "w-full h-40 cursor-crosshair" }} />
              </div>
            </div>

            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase rounded-2xl">⚠️ {error}</div>}

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50">
              {loading ? "Submitting Application..." : "Submit KYC Details"}
            </button>
          </form>

          <p className="text-center mt-8 text-xs font-bold text-slate-500">
            Already registered? <Link to="/login" className="text-indigo-600 font-black hover:underline uppercase">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;