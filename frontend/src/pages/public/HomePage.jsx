import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiVideo, FiShield, FiCheckCircle, FiArrowRight, FiUserCheck, FiZap } from 'react-icons/fi';

// --- Hero Section ---
// Focuses on the "Live Video Verification" and "AI Agent" concept.
const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-br from-indigo-900 via-[#1e1b4b] to-[#312e81] text-white py-28 px-12 flex flex-col lg:flex-row items-center justify-between overflow-hidden relative">
      {/* Decorative Blur Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl opacity-50"></div>
      
      <div className="max-w-3xl relative z-10">
        <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-full text-xs font-bold mb-8 border border-indigo-500/30 tracking-widest uppercase">
          <FiZap className="animate-pulse" /> Next-Gen AI Identity Verification
        </div>
        <h1 className="text-6xl lg:text-7xl font-black mb-6 leading-[1.05] tracking-tight">
          Seamless <br /> 
          <span className="text-indigo-400">Video KYC</span> <br /> 
          For Modern FinTech
        </h1>
        <p className="text-indigo-100/70 text-lg mb-10 max-w-xl leading-relaxed font-medium">
          Onboard customers in minutes with our AI-guided Video KYC. Automated PAN OCR, Face-matching, and live agent simulation.
        </p>
        <div className="flex flex-wrap gap-5">
          <button 
            onClick={() => navigate('/kyc-application')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-500/40 transform hover:-translate-y-1 transition duration-200 flex items-center gap-2"
          >
            Start Your KYC <FiArrowRight />
          </button>
          <button
           onClick={() => navigate('/dashboard')}
           className="bg-white/5 hover:bg-white/10 border border-white/20 px-10 py-4 rounded-2xl font-bold text-lg backdrop-blur-md transition duration-200">
            View API Docs
          </button>
        </div>
      </div>

      {/* Hero Visual: Representing the Video Session */}
      <div className="mt-20 lg:mt-0 relative z-10">
        <div className="bg-slate-900 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-slate-700/50 p-3 w-full max-w-sm transform lg:rotate-3">
          <div className="bg-slate-800 rounded-[2rem] overflow-hidden aspect-[3/4] relative group">
            <img 
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1000&auto=format&fit=crop" 
              alt="KYC User" 
              className="w-full h-full object-cover opacity-80"
            />
            {/* AI HUD Overlay */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none text-[10px] font-mono tracking-tighter">
                <div className="flex justify-between items-start">
                    <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded backdrop-blur-md animate-pulse">
                        LIVE_SCAN: ACTIVE
                    </div>
                    <div className="text-white/40 uppercase">Session: KYC-9921</div>
                </div>
                <div className="space-y-2">
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full w-2/3"></div>
                    </div>
                    <p className="text-indigo-300 font-bold uppercase tracking-widest text-[9px]">AI Agent: Please hold your PAN card</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Features Grid ---
const FeaturesOverview = () => {
  const features = [
    { title: 'Auto-PAN Detection', desc: 'Real-time OCR extraction using Vision APIs.', icon: <FiZap />, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Face Comparison', desc: 'Compare live selfie with ID photo using AI.', icon: <FiUserCheck />, color: 'text-indigo-500 bg-indigo-500/10' },
    { title: 'Live Signature', desc: 'Secure digital signatures with touch support.', icon: <FiCheckCircle />, color: 'text-green-500 bg-green-500/10' },
    { title: 'Bank-Grade Security', desc: 'AES-256 encrypted storage & processing.', icon: <FiShield />, color: 'text-blue-500 bg-blue-500/10' }
  ];

  return (
    <div className="py-24 px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {features.map((f, i) => (
        <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 group">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 transition-transform group-hover:scale-110 ${f.color}`}>
            {f.icon}
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-3 tracking-tight">{f.title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.desc}</p>
        </div>
      ))}
    </div>
  );
};

// --- Main Page ---
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fcfdfe] font-sans">
      <Hero />
      
      <div className="max-w-7xl mx-auto -mt-12 relative z-20">
        <FeaturesOverview />
      </div>

      <div className="max-w-7xl mx-auto px-12 py-20">
         <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full"></div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">Ready to automate your KYC?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-12 text-lg">
                Submit your identity details and experience the future of digital onboarding in under 2 minutes.
            </p>
            <div className="flex justify-center gap-4">
                <button 
                   onClick={() => navigate('/register')}
                   className="bg-indigo-500 hover:bg-indigo-600 text-white px-12 py-5 rounded-2xl font-bold shadow-xl transition-all"
                >
                    Get Started Now
                </button>
            </div>
         </div>
      </div>

      {/* Footer Info */}
      <footer className="py-12 border-t border-slate-100 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
          FinVerify Compliance Engine • Intern Assessment 2026
        </p>
      </footer>
    </div>
  );
};

export default HomePage;