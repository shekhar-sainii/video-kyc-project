import React from "react";
import { useSelector } from "react-redux";

const PublicLayout = ({ children }) => {
  const isDark = useSelector(
    (state) => state.theme.mode === "dark"
  );

  return (
    <div
      className={`min-h-screen pt-3
        ${isDark ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-900"}
      `}
    >
      <main className="max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;
