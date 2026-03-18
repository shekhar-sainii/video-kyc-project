import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiCamera, FiShield, FiMic } from "react-icons/fi";
import Swal from "sweetalert2";
import kycService from "../../services/kycService";

const VideoKYCSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isDark = useSelector((state) => state.theme.mode === "dark");
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const capturedImagesRef = useRef({ pan: null, selfie: null });
  const [step, setStep] = useState(1); // 1: Intro, 2: PAN, 3: Selfie, 4: Verifying

  // --- 1. AI AGENT VOICE (Text-to-Speech) ---
  const speak = (text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // --- 3. AI GUIDANCE LOGIC ---
  const guideUser = (currentStep) => {
    setStep(currentStep);
    switch (currentStep) {
      case 1:
        speak("Hello! I am your AI assistant. Let's get started with your Video KYC verification.");
        break;
      case 2:
        speak("Please hold your PAN card clearly in front of the camera.");
        break;
      case 3:
        speak("Great! Now, please look at the camera and smile for a selfie.");
        break;
      case 4:
        speak("Verification in progress. Please do not close the window.");
        break;
      default:
        break;
    }
  };

  // --- 2. WEBCAM INITIALIZATION ---
  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = mediaStream;
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch {
      Swal.fire("Camera Error", "Please allow camera permissions to continue.", "error");
    }
  };

  useEffect(() => {
    void startVideo();
    speak("Hello! I am your AI assistant. Let's get started with your Video KYC verification.");
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // --- 4. IMAGE CAPTURE ---
  const captureFrame = (type) => {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      Swal.fire("Camera Not Ready", "Please wait for the video feed to start.", "warning");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");

    const updated = { ...capturedImagesRef.current, [type]: dataUrl };
    capturedImagesRef.current = updated;

    if (type === "pan") {
      guideUser(3);
      return;
    }

    guideUser(4);
    setTimeout(() => verifyKYC(updated), 300);
  };

  // Helper: base64 dataURL to Blob
  const dataURLtoBlob = (dataUrl) => {
    const [header, data] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
    return new Blob([array], { type: mime });
  };

  // --- 5. BACKEND VERIFICATION (Real API Call) ---
  const verifyKYC = async (images) => {
    try {
      const formData = new FormData();
      formData.append("applicationId", id);
      formData.append("panCardImage", dataURLtoBlob(images.pan), "pan_card.jpg");
      formData.append("selfieImage", dataURLtoBlob(images.selfie), "selfie.jpg");

      const res = await kycService.verifyKyc(formData);
      const verificationData = res?.data?.data ?? {};
      const { face_match, pan_match, status, message } = verificationData;

      if (status === "Verified") {
        Swal.fire({
          icon: "success",
          title: "KYC Verified Successfully",
          text: "Your face and PAN details have matched.",
          confirmButtonColor: "#4f46e5",
        }).then(() => navigate("/dashboard"));
      } else {
        const reason = message || (
          !face_match && !pan_match ? "Face mismatch and PAN mismatch" :
          !face_match ? "Face mismatch" : "PAN mismatch"
        );
        Swal.fire({
          icon: "error",
          title: "KYC Verification Failed",
          text: reason,
          confirmButtonColor: "#ef4444",
        }).then(() => navigate("/dashboard"));
      }
    } catch (err) {
      const message = err?.response?.data?.message || "Verification failed. Please try again.";
      Swal.fire("Error", message, "error").then(() => navigate("/dashboard"));
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? "bg-[#0f172a]" : "bg-[#f4f7fe]"}`}>
      
      {/* Top Header */}
      <div className={`p-4 border-b flex justify-between items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <FiShield size={20} />
            </div>
            <div>
                <h2 className={`text-sm font-black uppercase tracking-widest ${isDark ? "text-white" : "text-slate-900"}`}>Secure Session</h2>
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">ID: {id}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>Recording Live</span>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="flex-1 relative flex items-center justify-center p-6">
        <div className="relative w-full max-w-4xl aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl bg-black border-4 border-indigo-600/20">
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1]" 
            />
            
            {/* HUD Overlays */}
            <div className="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none">
                <div className="flex justify-between items-start">
                    <div className="bg-black/40 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                        <p className="text-white/60 text-[10px] font-bold uppercase mb-1">Session Status</p>
                        <p className="text-green-400 text-xs font-black flex items-center gap-2">
                            <FiMic className="animate-bounce" /> AUDIO_STREAM: OK
                        </p>
                    </div>
                    <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                        AI GUIDED
                    </div>
                </div>

                {/* Instruction Card */}
                <div className="flex justify-center mb-4">
                    <div className="bg-black/60 backdrop-blur-xl border border-indigo-500/30 p-6 rounded-3xl max-w-md w-full text-center shadow-2xl">
                        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Instructions</p>
                        <h3 className="text-white text-lg font-bold leading-tight">
                            {step === 1 && "Welcome! Ready to begin?"}
                            {step === 2 && "Hold your PAN Card within the frame."}
                            {step === 3 && "Smile! Align your face for a selfie."}
                            {step === 4 && "Analyzing Identity Data..."}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Scanning Frame for PAN/Face */}
            {(step === 2 || step === 3) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`border-4 border-dashed border-indigo-400/50 rounded-3xl animate-pulse ${
                        step === 2 ? "w-2/3 h-1/2" : "w-1/3 aspect-square rounded-full"
                    }`}></div>
                </div>
            )}
        </div>
      </div>

      {/* Control Footer */}
      <div className={`p-8 border-t flex justify-center gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
        {step < 4 && (
            <button 
                onClick={() => step === 1 ? guideUser(2) : captureFrame(step === 2 ? 'pan' : 'selfie')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-3"
            >
                {step === 1 ? "I'm Ready" : step === 2 ? <><FiCamera /> Capture PAN</> : <><FiCamera /> Take Selfie</>}
            </button>
        )}
        
        {step === 4 && (
            <div className="flex items-center gap-4 px-8 py-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-indigo-500 text-xs font-black uppercase tracking-widest">Processing Vision AI...</span>
            </div>
        )}
      </div>

    </div>
  );
};

export default VideoKYCSession;
