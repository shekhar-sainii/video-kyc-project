import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit3,
  FiCamera,
  FiShield,
  FiLogOut,
  FiCheckCircle,
  FiFile,
  FiLoader,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { logout, loginSuccess } from "../../features/auth/authSlice";
import userService from "../../services/userService";
import Swal from "sweetalert2";

const getBackendOrigin = () => {
  const configuredUrl = import.meta.env.VITE_AUTH_SERVICE_URL;

  if (configuredUrl) {
    try {
      return new URL(configuredUrl).origin;
    } catch {
      return "";
    }
  }

  return "";
};

const toImageUrl = (profileImage) => {
  if (!profileImage) {
    return "";
  }

  if (profileImage.startsWith("http")) {
    return profileImage;
  }

  const backendOrigin = getBackendOrigin();
  return backendOrigin ? `${backendOrigin}${profileImage}` : profileImage;
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const authUser = useSelector((state) => state.auth.user);
  const authRole = useSelector((state) => state.auth.role);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await userService.getProfile();
        const user = res?.data?.data;

        setProfile(user);
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
          address: user?.address || "",
        });
        setImagePreview(toImageUrl(user?.profileImage));
      } catch (error) {
        const message = error?.response?.data?.message || "Unable to load profile.";
        Swal.fire("Error", message, "error");
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (selectedImage && imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [selectedImage, imagePreview]);

  const profileInitial = useMemo(
    () => (formData.name || profile?.name || authUser?.name || "U").charAt(0).toUpperCase(),
    [formData.name, profile?.name, authUser?.name]
  );

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImagePickerOpen = () => {
    fileInputRef.current?.click();
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("phone", formData.phone);
      payload.append("address", formData.address);

      if (selectedImage) {
        payload.append("profileImage", selectedImage);
      }

      const res = await userService.updateProfile(payload);
      const updatedUser = res?.data?.data;

      setProfile(updatedUser);
      setImagePreview(toImageUrl(updatedUser?.profileImage));
      setSelectedImage(null);
      setIsEditing(false);

      dispatch(
        loginSuccess({
          user: updatedUser,
          role: authRole,
        })
      );

      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile has been updated successfully.",
        confirmButtonColor: "#4f46e5",
        background: isDark ? "#1a2b4b" : "#fff",
        color: isDark ? "#fff" : "#1a2b4b",
      });
    } catch (error) {
      const message = error?.response?.data?.message || "Profile update failed.";
      Swal.fire("Error", message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "End Session?",
      text: "You will need to re-authenticate to access your KYC data.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Sign Out",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logout());
        navigate("/login");
      }
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#0f172a]" : "bg-[#f4f7fe]"}`}>
        <div className="flex items-center gap-3 text-indigo-500 font-bold">
          <FiLoader className="animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-10 px-6 transition-colors duration-300 ${isDark ? "bg-[#0f172a]" : "bg-[#f4f7fe]"}`}>
      <div className="max-w-5xl mx-auto">
        <div className={`relative rounded-[2.5rem] overflow-hidden border mb-10 ${isDark ? "bg-[#1a2b4b] border-slate-700 shadow-2xl" : "bg-white border-slate-200 shadow-sm"}`}>
          <div className="h-44 bg-gradient-to-r from-indigo-600 to-blue-700 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
          </div>

          <div className="px-10 pb-10">
            <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8 -mt-20">
              <div className="relative group">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className={`w-44 h-44 rounded-[3rem] object-cover shadow-2xl border-8 ${isDark ? "border-[#1a2b4b]" : "border-white"}`}
                  />
                ) : (
                  <div className={`w-44 h-44 rounded-[3rem] flex items-center justify-center text-6xl font-black text-white shadow-2xl border-8 ${isDark ? "bg-slate-800 border-[#1a2b4b]" : "bg-slate-300 border-white"}`}>
                    {profileInitial}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleImagePickerOpen}
                  className="absolute bottom-4 right-4 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all border-4 border-white dark:border-slate-800 cursor-pointer"
                >
                  <FiCamera size={20} />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </button>
              </div>

              <div className="text-center md:text-left flex-1 mb-2">
                <h1 className={`text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  {formData.name || "KYC Applicant"}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                  <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                    profile?.isEmailVerified
                      ? "text-green-500 bg-green-500/10 border-green-500/20"
                      : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                  }`}>
                    <FiCheckCircle size={12} /> {profile?.isEmailVerified ? "Verified Account" : "Email Pending"}
                  </span>
                  <span className={`text-sm font-bold opacity-60 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    UID: {profile?.id || authUser?.id || "N/A"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditing((prev) => !prev)}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  isEditing ? "bg-slate-500 text-white" : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95"
                }`}
              >
                {isEditing ? "Discard" : <><FiEdit3 /> Edit Identity</>}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="space-y-6">
            <div className={`p-8 rounded-[2rem] border ${isDark ? "bg-[#1a2b4b] border-slate-700 shadow-xl" : "bg-white border-slate-200 shadow-sm"}`}>
              <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-8">Verification Vault</h3>

              <div className="space-y-6">
                <DocItem icon={<FiFile />} label="Email Status" status={profile?.isEmailVerified ? "Verified" : "Pending"} date={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"} />
                <DocItem icon={<FiUser />} label="Role" status={profile?.role || "user"} date={profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString() : "No recent login"} />
                <DocItem icon={<FiShield />} label="Account State" status="Active" date={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"} />
              </div>

              <div className={`mt-10 pt-8 border-t ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                <button
                  onClick={handleLogout}
                  className="w-full p-4 rounded-2xl text-red-500 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-500/10 transition-all border border-red-500/10"
                >
                  <FiLogOut /> Terminate Session
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className={`p-10 rounded-[2.5rem] border ${isDark ? "bg-[#1a2b4b] border-slate-700 shadow-xl" : "bg-white border-slate-200 shadow-sm"}`}>
              <h2 className={`text-2xl font-black mb-10 tracking-tight flex items-center gap-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                <FiCheckCircle className="text-indigo-600" />
                Personal Credentials
              </h2>

              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ProfileInput label="Legal Full Name" value={formData.name} disabled={!isEditing} icon={<FiUser />} isDark={isDark} onChange={(val) => setFormData((prev) => ({ ...prev, name: val }))} />
                  <ProfileInput label="Email Identity" value={formData.email} disabled={true} icon={<FiMail />} isDark={isDark} />
                  <ProfileInput label="Mobile Number" value={formData.phone} disabled={!isEditing} icon={<FiPhone />} isDark={isDark} onChange={(val) => setFormData((prev) => ({ ...prev, phone: val }))} />
                  <ProfileInput label="Role" value={profile?.role || "user"} disabled={true} icon={<FiShield />} isDark={isDark} />
                </div>

                <div className="col-span-full">
                  <ProfileInput label="Permanent Residential Address" value={formData.address} disabled={!isEditing} icon={<FiMapPin />} isDark={isDark} onChange={(val) => setFormData((prev) => ({ ...prev, address: val }))} />
                </div>

                {(isEditing || selectedImage) && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {saving ? "Saving Profile..." : "Sync Identity Data"}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DocItem = ({ icon, label, status, date }) => (
  <div className="flex items-center gap-4">
    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{status}</p>
      <p className="text-[9px] font-medium opacity-40">{date}</p>
    </div>
  </div>
);

const ProfileInput = ({ label, value, disabled, icon, isDark, onChange = () => {} }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3">{label}</label>
    <div className="relative">
      <span className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${disabled ? "text-slate-400 opacity-40" : "text-indigo-600"}`}>
        {icon}
      </span>
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full p-5 pl-14 rounded-3xl outline-none border-2 transition-all font-bold text-sm ${
          disabled
            ? "bg-transparent border-transparent text-slate-500 cursor-not-allowed"
            : isDark
              ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500"
              : "bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-600 shadow-sm"
        }`}
      />
    </div>
  </div>
);

export default ProfilePage;
