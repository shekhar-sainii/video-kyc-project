import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

const AdminLayout = ({ children }) => {
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`flex min-h-screen
        ${isDark ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-900"}
      `}
    >
      {/* SIDEBAR */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={sidebarOpen}
        setMobileOpen={setSidebarOpen}
      />

      {/* MAIN CONTENT */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onAdminMenuToggle={() => setSidebarOpen((prev) => !prev)} />

        <main
          className={`flex-1 p-4 sm:p-5 lg:p-6
            ${isDark ? "bg-gray-900" : "bg-gray-100"}
          `}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
