import React from "react";
import { useSelector } from "react-redux";
import { 
  FiMail, FiPhone, FiMapPin, FiTarget, 
  FiUsers, FiZap, FiGithub, FiLinkedin 
} from "react-icons/fi";

const AboutContactPage = () => {
  const isDark = useSelector((state) => state.theme.mode === "dark");

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0f172a] text-white" : "bg-gray-50 text-gray-900"}`}>
      
      {/* 1. HERO SECTION (ABOUT US) */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-6 leading-none">
            Our <span className="text-[#F84464]">Vision</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl font-medium opacity-60 leading-relaxed">
            We are more than just a ticketing platform. We are a bridge between you and your next unforgettable memory. 
            From the loudest concerts to the quietest dramas, we bring it all to your fingertips.
          </p>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-[#F84464] rounded-full blur-[120px]" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-600 rounded-full blur-[120px]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 pb-24">
        
        {/* 2. CORE VALUES SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <ValueCard 
            icon={<FiTarget />} 
            title="Our Mission" 
            desc="To provide a seamless, 1-click booking experience for every entertainment enthusiast in the country."
            isDark={isDark}
          />
          <ValueCard 
            icon={<FiUsers />} 
            title="Our Team" 
            desc="A group of passionate developers and cinema lovers dedicated to building India's favorite entertainment clone."
            isDark={isDark}
          />
          <ValueCard 
            icon={<FiZap />} 
            title="Speed" 
            desc="Engineered for speed. From searching a movie to getting your M-Ticket, it only takes seconds."
            isDark={isDark}
          />
        </div>

        {/* 3. CONTACT SECTION (GRID) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          
          {/* LEFT: CONTACT INFO (2 Columns) */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Get In <span className="text-[#F84464]">Touch</span></h2>
              <p className="opacity-60 text-sm font-bold uppercase tracking-widest">We'd love to hear from you. Whether it's a bug report or a feature request!</p>
            </div>

            <div className="space-y-6">
              <ContactInfo icon={<FiMail />} label="Email Us" value="support@bm-clone.com" />
              <ContactInfo icon={<FiPhone />} label="Call Us" value="+91 9999 000 000" />
              <ContactInfo icon={<FiMapPin />} label="Visit Us" value="BKC, Mumbai, Maharashtra, India" />
            </div>

            <div className="pt-10 border-t border-gray-500/10">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">Follow the Journey</p>
               <div className="flex gap-4">
                  <a href="#" className="p-3 bg-gray-500/10 rounded-xl hover:bg-[#F84464] hover:text-white transition-all"><FiGithub size={20} /></a>
                  <a href="#" className="p-3 bg-gray-500/10 rounded-xl hover:bg-[#F84464] hover:text-white transition-all"><FiLinkedin size={20} /></a>
               </div>
            </div>
          </div>

          {/* RIGHT: CONTACT FORM (3 Columns) */}
          <div className={`lg:col-span-3 p-8 md:p-12 rounded-[3rem] border ${isDark ? "bg-[#1f2533] border-gray-800 shadow-2xl" : "bg-white border-gray-100 shadow-2xl"}`}>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormInput label="Full Name" placeholder="Your Name" isDark={isDark} />
                 <FormInput label="Email" placeholder="name@example.com" isDark={isDark} />
              </div>
              <FormInput label="Subject" placeholder="How can we help?" isDark={isDark} />
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Message</label>
                <textarea 
                  rows="4"
                  placeholder="Tell us what's on your mind..."
                  className={`w-full p-4 rounded-3xl outline-none border-2 transition-all focus:border-[#F84464] resize-none ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100"}`}
                ></textarea>
              </div>
              <button className="w-full bg-[#F84464] hover:bg-[#d63a56] text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-red-500/30 transition-all active:scale-95">
                Send Message
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

// HELPER COMPONENTS
const ValueCard = ({ icon, title, desc, isDark }) => (
  <div className={`p-8 rounded-[2.5rem] border transition-all hover:-translate-y-2 ${isDark ? "bg-[#1f2533] border-gray-800" : "bg-white border-gray-100 shadow-lg"}`}>
    <div className="w-14 h-14 bg-[#F84464]/10 text-[#F84464] rounded-2xl flex items-center justify-center text-2xl mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">{title}</h3>
    <p className="text-sm opacity-60 leading-relaxed">{desc}</p>
  </div>
);

const ContactInfo = ({ icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="text-[#F84464] text-xl">{icon}</div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  </div>
);

const FormInput = ({ label, placeholder, isDark }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">{label}</label>
    <input 
      type="text" 
      placeholder={placeholder}
      className={`p-4 rounded-3xl outline-none border-2 transition-all focus:border-[#F84464] ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100"}`}
    />
  </div>
);

export default AboutContactPage;