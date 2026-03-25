import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { FiCreditCard, FiCheckCircle, FiUploadCloud, FiTrash2, FiEdit3 } from "react-icons/fi";
import Swal from "sweetalert2";
import kycService from "../../services/kycService";

const KYCApplicationForm = () => {
    const navigate = useNavigate();
    const isDark = useSelector((state) => state.theme.mode === "dark");
    const sigCanvas = useRef(null);

    const [form, setForm] = useState({
        full_name: "",
        pan_number: "",
        photo: null,
        photoPreview: null,
    });
    const [loading, setLoading] = useState(false);

    // --- Handlers ---
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        const pan = form.pan_number.toUpperCase();
        const fullName = form.full_name.trim();

        if (!fullName) {
          return Swal.fire("Name Required", "Please enter your full name as per PAN card", "warning");
        }

        if (!panRegex.test(pan)) {
            return Swal.fire("Invalid PAN", "Please enter a valid 10-digit PAN", "error");
        }

        // Advanced Validation
        const fourthChar = pan[3];
        const fifthChar = pan[4];
        const VALID_TYPES = ["P", "C", "H", "A", "B", "G", "J", "L", "F", "T"];

        if (!VALID_TYPES.includes(fourthChar)) {
          return Swal.fire("Suspicious PAN", `Invalid entity type '${fourthChar}'. Please check your card.`, "error");
        }

        // 4th Char Rule: Individual Check (User is likely Individual)
        if (fourthChar !== "P" && fullName.split(" ").length > 0) {
           const confirm = await Swal.fire({
             title: "Is this a Personal PAN?",
             text: `The 4th character '${fourthChar}' indicates a non-individual entity. Individuals usually have 'P'. Proceed anyway?`,
             icon: "warning",
             showCancelButton: true,
           });
           if (!confirm.isConfirmed) return;
        }

        // 5th Char Rule: Name Initial
        const nameParts = fullName.split(/\s+/);
        let expectedInitial = "";
        
        if (fourthChar === "P") {
          const surname = nameParts[nameParts.length - 1];
          expectedInitial = surname ? surname[0].toUpperCase() : "";
        } else {
          expectedInitial = nameParts[0] ? nameParts[0][0].toUpperCase() : "";
        }

        if (fifthChar !== expectedInitial) {
           return Swal.fire(
             "PAN Structure Error", 
             `The 5th character '${fifthChar}' does not match your name initial '${expectedInitial}'. Please verify your PAN.`, 
             "error"
           );
        }

        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            return Swal.fire("Signature Required", "Please provide your digital signature.", "warning");
        }

        if (!form.photo) {
            return Swal.fire("Photo Required", "Please upload a photo.", "warning");
        }

        try {
            setLoading(true);
            const signatureData = sigCanvas.current
                .getCanvas()
                .toDataURL("image/png");

            const formData = new FormData();

            formData.append("fullName", fullName);
            formData.append("panNumber", pan);
            formData.append("signature", signatureData);
            formData.append("uploadedPhoto", form.photo);

            await kycService.submitKyc(formData);

    Swal.fire({
      icon: "success",
      title: "Application Submitted",
      text: "KYC submitted successfully",
      timer: 2000,
      showConfirmButton: false,
    });

    setTimeout(() => navigate("/dashboard"), 2000);
  } catch (err) {
    console.error(err);

    const message =
      err?.response?.data?.message ||
      err?.message ||
      "Submission failed. Try again.";

    Swal.fire("Error", message, "error");
  } finally {
    setLoading(false);
  }
};

    return (
        <div className={`min-h-screen py-12 px-6 transition-colors duration-300 ${isDark ? "bg-[#0f172a]" : "bg-[#f8fafd]"}`}>
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className={`text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                        KYC Registration
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium italic">Step 1: Identity & Documentation</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column: PAN & Photo */}
                    <div className="space-y-8">
                        {/* Full Name Input */}
                        <div className={`p-8 rounded-4xl border-2 transition-all ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-4">
                                Full Name (As per PAN Card)
                            </label>
                            <input
                                type="text"
                                placeholder="SHEKHAR SAINI"
                                value={form.full_name}
                                onChange={(e) => setForm({ ...form, full_name: e.target.value.toUpperCase() })}
                                className={`w-full p-4 rounded-2xl border-2 outline-none font-bold text-lg transition-all ${isDark ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-600"
                                    }`}
                            />
                        </div>

                        {/* PAN Card Input */}
                        <div className={`p-8 rounded-4xl border-2 transition-all ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-4">
                                <FiCreditCard /> PAN Card Number
                            </label>
                            <input
                                type="text"
                                placeholder="ABCDE1234F"
                                maxLength={10}
                                value={form.pan_number}
                                onChange={(e) => setForm({ ...form, pan_number: e.target.value.toUpperCase() })}
                                className={`w-full p-4 rounded-2xl border-2 outline-none font-bold tracking-widest text-lg transition-all ${isDark ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-600"
                                    }`}
                            />
                        </div>

                        {/* Photo Upload */}
                        <div className={`p-8 rounded-4xl border-2 transition-all ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-6">
                                <FiUploadCloud /> Passport Size Photo
                            </label>

                            <div className="flex flex-col items-center">
                                {form.photoPreview ? (
                                    <div className="relative group w-40 h-48">
                                        <img src={form.photoPreview} alt="Preview" className="w-full h-full object-cover rounded-2xl border-4 border-indigo-600/20" />
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, photo: null, photoPreview: null })}
                                            className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className={`w-full h-48 border-2 border-dashed rounded-4xl flex flex-col items-center justify-center cursor-pointer transition-all ${isDark ? "border-slate-700 hover:border-indigo-500 bg-slate-800/50" : "border-slate-200 hover:border-indigo-600 bg-slate-50"
                                        }`}>
                                        <FiUploadCloud size={32} className="text-slate-400 mb-2" />
                                        <span className="text-xs font-bold text-slate-500">Click to upload selfie</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Signature */}
                    <div className={`p-8 rounded-4xl border-2 flex flex-col transition-all ${isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}>
                        <div className="flex justify-between items-center mb-6">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
                                <FiEdit3 /> Digital Signature
                            </label>
                            <button type="button" onClick={clearSignature} className="text-[10px] font-bold text-red-500 uppercase hover:underline">
                                Clear Pad
                            </button>
                        </div>

                        <div className={`flex-1 rounded-2xl border-2 border-dashed overflow-hidden ${isDark ? "bg-white border-slate-600" : "bg-slate-50 border-slate-200"}`}>
                            <SignatureCanvas
                                ref={sigCanvas}
                                penColor="black"
                                canvasProps={{ className: "w-full h-full cursor-crosshair min-h-[300px]" }}
                            />
                        </div>
                        <p className="mt-4 text-[10px] text-slate-400 font-medium italic text-center">Draw your signature inside the box above using mouse or touch.</p>
                    </div>

                    {/* Submit Button */}
                    <div className="lg:col-span-2 mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-4xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? "Processing Data..." : <>Finalize Application <FiCheckCircle /></>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default KYCApplicationForm;