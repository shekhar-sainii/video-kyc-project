import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toggleTheme } from "../../features/theme/themeSlice";
import { logout } from "../../features/auth/authSlice";
import {
  FiSun,
  FiMoon,
  FiChevronDown,
  FiLogOut,
  FiUser,
  FiVideo,
  FiShield,
  FiList,
  FiCheckCircle,
  FiMenu,
} from "react-icons/fi";

const toImageUrl = (profileImage) => {
  if (!profileImage) {
    return "";
  }

  if (profileImage.startsWith("http")) {
    return profileImage;
  }

  const configuredUrl = import.meta.env.VITE_AUTH_SERVICE_URL;

  if (!configuredUrl) {
    return profileImage;
  }

  try {
    return `${new URL(configuredUrl).origin}${profileImage}`;
  } catch {
    return profileImage;
  }
};

const Navbar = ({ onAdminMenuToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileImageUrl = toImageUrl(user?.profileImage);
  const isAdminUser = user?.role === "admin";
  const isAdminPanel = isAdminUser && location.pathname.startsWith("/admin");

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 border-b transition-all duration-300 backdrop-blur-md ${
      isDark ? "bg-[#0f172a]/80 border-slate-800" : "bg-white/80 border-slate-100 shadow-sm"
    }`}>
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">
        
        {/* LEFT: FinVerify Branding */}
        <div className="flex items-center gap-4 sm:gap-8 lg:gap-12">
          {isAdminPanel && (
            <button
              onClick={onAdminMenuToggle}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border lg:hidden ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-slate-100"
                  : "border-slate-200 bg-white text-slate-700 shadow-sm"
              }`}
              aria-label="Toggle admin navigation"
            >
              <FiMenu size={18} />
            </button>
          )}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-xl shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <FiShield size={22} />
            </div>
            <div className="flex flex-col">
              <span className={`text-lg font-black tracking-tight leading-none sm:text-xl ${isDark ? "text-white" : "text-[#1e1b4b]"}`}>
                {isAdminPanel ? "Admin" : "FinVerify"}
              </span>
              <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-1">
                {isAdminPanel ? "Control Panel" : "Identity Pro"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {!isAdminPanel && (
            <div className={`hidden md:flex gap-8 text-[11px] font-black uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              <NavLink to="/dashboard" label="Applications" isActive={isActive("/dashboard")} isDark={isDark} />
              <NavLink to="/kyc-application" label="New KYC" isActive={isActive("/kyc-form")} isDark={isDark} />
            </div>
          )}
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2 sm:gap-5">
          
          {/* Theme Toggle */}
          <button 
            onClick={() => dispatch(toggleTheme())}
            className={`p-2.5 rounded-xl border transition-all ${
              isDark ? "text-amber-400 bg-slate-800 border-slate-700 hover:bg-slate-700" : "text-slate-400 bg-slate-50 border-slate-100 hover:bg-slate-100"
            }`}
          >
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2 p-1.5 pr-2 sm:gap-3 sm:pr-4 rounded-2xl border-2 transition-all hover:shadow-lg ${
                  isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-100 text-slate-800 shadow-sm"
                }`}
              >
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="w-9 h-9 rounded-xl object-cover shadow-lg shadow-indigo-500/20"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-indigo-500/20">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter leading-none mb-1">Authenticated</p>
                    <p className="text-xs font-bold truncate max-w-[80px] leading-none">
                        {user?.name?.split(" ")[0]}
                    </p>
                </div>
                <FiChevronDown size={14} className={`hidden sm:block transition-transform duration-300 opacity-40 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div className={`absolute right-0 mt-4 w-[min(16rem,calc(100vw-1rem))] rounded-[2rem] shadow-2xl border overflow-hidden animate-in slide-in-from-top-2 duration-300 ${
                  isDark ? "bg-[#1a2133] border-slate-700 text-slate-200" : "bg-white border-slate-100 text-slate-800"
                }`}>
                  <div className={`px-6 py-5 border-b ${isDark ? "border-slate-700 bg-slate-800/40" : "border-slate-100 bg-slate-50/50"}`}>
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">User Workspace</p>
                    <p className="text-sm font-black truncate">{user?.name}</p>
                    <p className="text-[10px] font-bold opacity-40 truncate">{user?.email}</p>
                  </div>

                  <div className="p-3">
                    <DropdownLink to="/profile" icon={<FiUser />} label="Profile Settings" isDark={isDark} />
                    <DropdownLink to="/dashboard" icon={<FiList />} label="KYC History" isDark={isDark} />
                    {/* <DropdownLink to="/dashboard" icon={<FiVideo />} label="Start Video KYC" isDark={isDark} /> */}
                  </div>

                  <button 
                    onClick={handleLogout} 
                    className={`w-full flex items-center justify-center gap-3 py-4 text-xs font-black text-red-500 uppercase tracking-widest border-t transition-colors ${
                      isDark ? "border-slate-700 hover:bg-red-500/10" : "border-slate-100 hover:bg-red-50"
                    }`}
                  >
                    <FiLogOut /> Terminate Session
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className={`text-xs font-black uppercase tracking-widest px-4 ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-indigo-600"}`}>
                Sign In
              </Link>
              <Link to="/register" className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 transition-all hover:-translate-y-1">
                Begin KYC
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// --- HELPER COMPONENTS ---

const NavLink = ({ to, label, isActive, isDark }) => (
  <Link 
    to={to} 
    className={`transition-all relative py-2 ${
      isActive 
      ? "text-indigo-600 font-black" 
      : isDark ? "hover:text-white" : "hover:text-indigo-600"
    }`}
  >
    {label}
    {isActive && (
        <span className="absolute -bottom-1 left-0 w-full h-1 bg-indigo-600 rounded-full"></span>
    )}
  </Link>
);

const DropdownLink = ({ to, icon, label, isDark }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
      isDark ? "hover:bg-slate-800 text-slate-300" : "hover:bg-indigo-50 text-slate-700"
    }`}
  >
    <span className="text-indigo-500">{icon}</span> {label}
  </Link>
);

export default Navbar;
