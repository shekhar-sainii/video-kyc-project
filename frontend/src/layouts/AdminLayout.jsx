import React from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

const AdminLayout = ({ children }) => {
  const isDark = useSelector(
    (state) => state.theme.mode === "dark"
  );

  return (
    <div
      className={`flex min-h-screen
        ${isDark ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-900"}
      `}
    >
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main
          className={`flex-1 p-6
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
